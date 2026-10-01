/**
 * CORRESPONDANCE TOUCHES / BOUTONS → ACTIONS
 * ---------------------------------------------------------------------------
 * Le jeu ne lit JAMAIS une touche directement : il lit des ACTIONS.
 * Pour changer une touche, modifie uniquement ce fichier.
 *
 * Clavier : on utilise e.code (position PHYSIQUE de la touche), donc ZQSD sur
 * AZERTY = WASD sur QWERTY automatiquement ("KeyW" = touche Z en AZERTY).
 *
 * Manette : "Standard Gamepad" (Xbox / PlayStation / 8BitDo sur iPad & PC)
 *   0 A/Croix   1 B/Rond   2 X/Carré   3 Y/Triangle
 *   4 LB/L1     5 RB/R1    6 LT/L2     7 RT/R2
 *   8 Select    9 Start   10 L3       11 R3
 *  12 Haut     13 Bas     14 Gauche   15 Droite
 */

export type Action =
  | 'confirm' // valider / interagir (caresser le mouton)
  | 'back' // retour dans les menus
  | 'run' // maintenir : galoper sur le mouton
  | 'photo' // ouvrir / fermer l'appareil photo
  | 'shutter' // déclencher (en mode photo)
  | 'vehicle' // menu des véhicules
  | 'map' // carte
  | 'album' // album photo
  | 'pause' // menu pause
  | 'call' // appeler le mouton ("Bêê !")
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'tabLeft'
  | 'tabRight';

export const KEYBOARD: Record<Action, string[]> = {
  confirm: ['Space', 'Enter', 'KeyF'],
  back: ['Escape', 'Backspace'],
  run: ['ShiftLeft', 'ShiftRight'],
  photo: ['KeyC'],
  shutter: ['Space', 'Enter'],
  vehicle: ['KeyV'],
  map: ['KeyM'],
  album: ['KeyB'],
  pause: ['Escape'],
  call: ['KeyR'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  tabLeft: ['KeyQ', 'PageUp'],
  tabRight: ['KeyE', 'PageDown'],
};

export const GAMEPAD: Record<Action, number[]> = {
  confirm: [0],
  back: [1],
  run: [1],
  photo: [3],
  shutter: [0, 5],
  vehicle: [2],
  map: [8],
  album: [13],
  pause: [9],
  call: [12],
  up: [12],
  down: [13],
  left: [14],
  right: [15],
  tabLeft: [4],
  tabRight: [5],
};

/** Touches de déplacement (axes analogiques simulés au clavier). */
export const MOVE_KEYS = { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'] };
/** Touches de rotation caméra. */
export const LOOK_KEYS = { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'] };
/** Zoom (photo) : KeyE / KeyQ = position physique E / A en AZERTY. */
export const ZOOM_KEYS = { in: ['KeyE'], out: ['KeyQ'] };

/** Zone morte des sticks analogiques. */
export const STICK_DEADZONE = 0.18;
