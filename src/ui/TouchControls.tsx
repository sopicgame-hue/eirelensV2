/**
 * Commandes tactiles (iPad sans manette) : joystick virtuel à gauche,
 * glisser à droite pour tourner la caméra, boutons d'action à droite.
 * Elles écrivent dans game.input.virtual — le reste du jeu ne voit que des actions.
 * Masquées automatiquement dès qu'une manette est utilisée.
 */
import React, { useRef, useState } from 'react';
import { getGame } from './gameRef';
import { useUi } from './uiStore';
import type { Action } from '../input/bindings';

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export function TouchControls() {
  const device = useUi((s) => s.device);
  const screen = useUi((s) => s.screen);
  if (!isTouchDevice || device === 'gamepad') return null;
  const inPhoto = screen === 'photo';
  return (
    <div className="pointer-events-none absolute inset-0 select-none" style={{ touchAction: 'none' }}>
      <LookPad />
      <Joystick />
      <div className="pointer-events-auto absolute bottom-6 right-6 grid grid-cols-3 gap-3">
        {inPhoto ? (
          <>
            <TButton key="tabLeft" action="tabLeft" label="−" zoom={-1} />
            <TButton key="shutter" action="shutter" label="📷" big />
            <TButton key="tabRight" action="tabRight" label="+" zoom={1} />
            <TButton key="back" action="back" label="✕" />
          </>
        ) : (
          <>
            <TButton key="vehicle" action="vehicle" label="🚲" />
            <TButton key="photo" action="photo" label="📷" big />
            <TButton key="run" action="run" label="🐑" />
            <TButton key="confirm" action="confirm" label="A" />
            <TButton key="map" action="map" label="🗺" />
            <TButton key="pause" action="pause" label="☰" />
          </>
        )}
      </div>
    </div>
  );
}

function TButton({ action, label, big, zoom }: { action: Action; label: string; big?: boolean; zoom?: number }) {
  const [down, setDown] = useState(false);
  const press = (on: boolean) => {
    const g = getGame();
    if (!g) return;
    g.unlockAudio();
    g.input.device = 'touch';
    setDown(on);
    if (on) {
      g.input.virtual.buttons.add(action);
      g.input.tapAction(action);
    } else g.input.virtual.buttons.delete(action);
    if (zoom) g.input.virtual.zoom = on ? zoom : 0;
  };
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        press(true);
      }}
      onPointerUp={() => press(false)}
      onPointerLeave={() => press(false)}
      onPointerCancel={() => press(false)}
      className={`flex items-center justify-center rounded-full border-4 border-white/80 font-black text-white shadow-lg ${big ? 'h-20 w-20 text-3xl' : 'h-14 w-14 text-xl'} ${down ? 'bg-white/50' : 'bg-black/35'}`}
    >
      {label}
    </button>
  );
}

function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const R = 55;
  const update = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    setKnob({ x: dx, y: dy });
    const g = getGame();
    if (g) {
      g.input.virtual.moveX = dx / R;
      g.input.virtual.moveY = -dy / R;
      g.input.device = 'touch';
    }
  };
  const end = () => {
    id.current = null;
    setKnob({ x: 0, y: 0 });
    const g = getGame();
    if (g) g.input.virtual.moveX = g.input.virtual.moveY = 0;
  };
  return (
    <div
      ref={base}
      className="pointer-events-auto absolute bottom-8 left-8 h-36 w-36 rounded-full border-4 border-white/60 bg-black/20"
      onPointerDown={(e) => {
        id.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        getGame()?.unlockAudio();
        update(e);
      }}
      onPointerMove={(e) => id.current === e.pointerId && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-white/80" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}

/** Zone de glisser (moitié droite de l'écran) pour orienter la caméra. */
function LookPad() {
  const last = useRef<{ x: number; y: number; id: number } | null>(null);
  return (
    <div
      className="pointer-events-auto absolute right-0 top-0 h-full w-1/2"
      onPointerDown={(e) => (last.current = { x: e.clientX, y: e.clientY, id: e.pointerId })}
      onPointerMove={(e) => {
        if (!last.current || last.current.id !== e.pointerId) return;
        getGame()?.input.pushLookDelta(e.clientX - last.current.x, e.clientY - last.current.y);
        last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      }}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    />
  );
}
