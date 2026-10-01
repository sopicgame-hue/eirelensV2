/**
 * Input — fusionne clavier, souris, manette et commandes tactiles en ACTIONS.
 *
 * Utilisation côté jeu (dans un update(dt)) :
 *   input.move.x / input.move.y   → stick gauche (-1..1), y = +1 vers l'avant
 *   input.look.x / input.look.y   → stick droit / flèches (vitesse, -1..1)
 *   input.lookDelta.x / .y        → glisser souris / tactile (radians, déjà intégrés)
 *   input.zoom                    → -1..1 (gâchettes RT/LT, E/A, molette)
 *   input.isDown('run')           → maintenu
 *   input.pressed('photo')        → vient d'être appuyé CETTE frame
 *
 * Utilisation côté UI (React) : input.onAction(cb) — voir ui/useGameInput.ts.
 * update() est appelé UNE fois par frame par Game, avant tous les systèmes.
 */
import { Action, KEYBOARD, GAMEPAD, MOVE_KEYS, LOOK_KEYS, ZOOM_KEYS, STICK_DEADZONE } from './bindings';
import { CAMERA } from '../config/gameConfig';

export type InputDevice = 'keyboard' | 'gamepad' | 'touch';

const ALL_ACTIONS = Object.keys(KEYBOARD) as Action[];
const NAV_ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

export class Input {
  readonly move = { x: 0, y: 0 };
  readonly look = { x: 0, y: 0 };
  /** Rotation directe de cette frame (souris, glisser tactile), en radians. Indépendante des FPS. */
  readonly lookDelta = { x: 0, y: 0 };
  zoom = 0;
  /** Dernier périphérique utilisé (pour afficher les bonnes icônes de boutons). */
  device: InputDevice = typeof window !== 'undefined' && 'ontouchstart' in window ? 'touch' : 'keyboard';
  gamepadName = '';
  /** Commandes tactiles (écrites par ui/TouchControls.tsx). */
  readonly virtual = { moveX: 0, moveY: 0, zoom: 0, buttons: new Set<Action>() };

  private keys = new Set<string>();
  /** Touches appuyées depuis la dernière frame (même si déjà relâchées : tap très court). */
  private tapped = new Set<string>();
  private tappedActions = new Set<Action>();
  private down = new Set<Action>();
  private prev = new Set<Action>();
  private mouseDX = 0;
  private mouseDY = 0;
  private wheel = 0;
  private dragging = false;
  private listeners = new Set<(a: Action) => void>();
  private navRepeat: Partial<Record<Action, number>> = {};
  private target: HTMLElement | null = null;

  attach(canvas: HTMLElement) {
    this.target = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('wheel', this.onWheel, { passive: true });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.target?.removeEventListener('pointerdown', this.onPointerDown);
    this.target?.removeEventListener('wheel', this.onWheel);
    this.listeners.clear();
  }

  isDown(a: Action) {
    return this.down.has(a);
  }
  pressed(a: Action) {
    return this.down.has(a) && !this.prev.has(a);
  }
  released(a: Action) {
    return !this.down.has(a) && this.prev.has(a);
  }

  /** Relâche toutes les commandes tactiles (appelé à chaque changement d'écran). */
  resetVirtual() {
    const v = this.virtual;
    v.moveX = v.moveY = v.zoom = 0;
    v.buttons.clear();
  }

  /** Déclenche une action pour la prochaine frame (bouton tactile tapé très vite). */
  tapAction(a: Action) {
    this.tappedActions.add(a);
  }

  /** Glisser tactile (ou autre) : ajoute un déplacement de caméra pour la prochaine frame. */
  pushLookDelta(dx: number, dy: number) {
    this.mouseDX += dx;
    this.mouseDY += dy;
  }

  /** Abonnement UI : appelé à chaque nouvel appui (et répétition des flèches). */
  onAction(cb: (a: Action) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /** Vibration courte de la manette (si supportée). */
  rumble(strength = 0.4, ms = 80) {
    const pad = this.activePad();
    const act = (pad as any)?.vibrationActuator;
    act?.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: strength, weakMagnitude: strength }).catch?.(() => {});
  }

  update(dt: number) {
    // Échange des deux ensembles (aucune allocation par frame)
    const tmp = this.prev;
    this.prev = this.down;
    this.down = tmp;
    this.down.clear();

    // --- Clavier
    for (const a of ALL_ACTIONS) if (KEYBOARD[a].some((k) => this.keys.has(k) || this.tapped.has(k))) this.down.add(a);
    this.tapped.clear();
    let mx = axisFromKeys(this.keys, MOVE_KEYS.left, MOVE_KEYS.right);
    let my = axisFromKeys(this.keys, MOVE_KEYS.down, MOVE_KEYS.up);
    let lx = axisFromKeys(this.keys, LOOK_KEYS.left, LOOK_KEYS.right);
    let ly = axisFromKeys(this.keys, LOOK_KEYS.down, LOOK_KEYS.up);
    let zoom = axisFromKeys(this.keys, ZOOM_KEYS.out, ZOOM_KEYS.in);

    // --- Souris / glisser tactile : rotation directe (radians), molette = zoom
    this.lookDelta.x = this.mouseDX * CAMERA.DRAG_SENSITIVITY;
    this.lookDelta.y = this.mouseDY * CAMERA.DRAG_SENSITIVITY;
    this.mouseDX = this.mouseDY = 0;
    if (this.wheel !== 0) {
      zoom += -Math.sign(this.wheel) * 3;
      this.wheel = 0;
    }

    // --- Manette
    const pad = this.activePad();
    if (pad) {
      this.gamepadName = pad.id;
      const ax = (i: number) => deadzone(pad.axes[i] ?? 0);
      const pmx = ax(0);
      const pmy = -ax(1);
      const plx = ax(2);
      const ply = -ax(3);
      const btn = (i: number) => !!pad.buttons[i]?.pressed;
      const val = (i: number) => pad.buttons[i]?.value ?? 0;
      let any = Math.abs(pmx) + Math.abs(pmy) + Math.abs(plx) + Math.abs(ply) > 0;
      for (const a of ALL_ACTIONS)
        if (GAMEPAD[a].some(btn)) {
          this.down.add(a);
          any = true;
        }
      const trig = val(7) - val(6);
      if (Math.abs(trig) > 0.05) any = true;
      if (any) this.device = 'gamepad';
      mx += pmx;
      my += pmy;
      lx += plx;
      ly += ply;
      zoom += trig;
      // Stick gauche = navigation dans les menus aussi
      if (pmy > 0.6) this.down.add('up');
      if (pmy < -0.6) this.down.add('down');
      if (pmx < -0.6) this.down.add('left');
      if (pmx > 0.6) this.down.add('right');
    }

    // --- Tactile
    const v = this.virtual;
    mx += v.moveX;
    my += v.moveY;
    zoom += v.zoom;
    v.buttons.forEach((a) => this.down.add(a));
    this.tappedActions.forEach((a) => this.down.add(a));
    this.tappedActions.clear();

    const len = Math.hypot(mx, my);
    this.move.x = len > 1 ? mx / len : mx;
    this.move.y = len > 1 ? my / len : my;
    this.look.x = Math.max(-3, Math.min(3, lx));
    this.look.y = Math.max(-3, Math.min(3, ly));
    this.zoom = Math.max(-3, Math.min(3, zoom));

    // --- Notifications UI (appui + répétition des directions)
    for (const a of this.down) {
      if (!this.prev.has(a)) {
        this.emit(a);
        if (NAV_ACTIONS.includes(a)) this.navRepeat[a] = 0.4;
      } else if (NAV_ACTIONS.includes(a)) {
        this.navRepeat[a] = (this.navRepeat[a] ?? 0.4) - dt;
        if (this.navRepeat[a]! <= 0) {
          this.emit(a);
          this.navRepeat[a] = 0.12;
        }
      }
    }
  }

  private emit(a: Action) {
    this.listeners.forEach((cb) => cb(a));
  }

  private activePad(): Gamepad | null {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    this.keys.add(e.code);
    this.tapped.add(e.code);
    this.device = 'keyboard';
    // Entrée/Espace : empêche aussi le "clic" natif sur le bouton qui a le focus (double validation)
    if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onBlur = () => this.keys.clear();
  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      this.device = 'touch'; // le tactile lui-même passe par TouchControls
      return;
    }
    this.dragging = true;
    this.device = 'keyboard';
  };
  private onPointerUp = () => (this.dragging = false);
  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging || e.pointerType === 'touch') return;
    this.mouseDX += e.movementX;
    this.mouseDY += e.movementY;
  };
  private onWheel = (e: WheelEvent) => (this.wheel += e.deltaY);
}

function axisFromKeys(keys: Set<string>, neg: string[], pos: string[]) {
  return (pos.some((k) => keys.has(k)) ? 1 : 0) - (neg.some((k) => keys.has(k)) ? 1 : 0);
}

function deadzone(v: number) {
  if (Math.abs(v) < STICK_DEADZONE) return 0;
  return Math.sign(v) * ((Math.abs(v) - STICK_DEADZONE) / (1 - STICK_DEADZONE));
}
