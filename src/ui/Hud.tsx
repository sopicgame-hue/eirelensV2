/**
 * HUD en jeu : lieu + heure (haut gauche), boussole des monuments (haut centre),
 * compteur de monuments (haut droite), dialogue du mouton (bas), notifications,
 * rappel des commandes (bas droite).
 */
import React, { useEffect, useState } from 'react';
import { useUi } from './uiStore';
import { Key, formatHour } from './components';
import { getGame } from './gameRef';
import { getVehicle } from '../content/vehicles';

export function Hud() {
  const hud = useUi((s) => s.hud);
  const device = useUi((s) => s.device);
  const vehicle = hud.vehicleId === 'sheep' ? '🐑 Au galop' : hud.vehicleId === 'foot' ? '🥾 À pied' : `${getVehicle(hud.vehicleId)?.icon ?? ''} ${getVehicle(hud.vehicleId)?.name ?? ''}`;
  const sheepName = getGame()?.save.sheepName ?? 'Paddy';
  return (
    <div className="pointer-events-none absolute inset-0 select-none p-3 text-white sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl border-2 border-white/70 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
          <div className="text-base font-extrabold leading-tight sm:text-lg">{hud.region}</div>
          <div className="text-xs opacity-90 sm:text-sm">
            {timeIcon(hud.hour)} {formatHour(hud.hour)} · {vehicle}
          </div>
        </div>
        <Compass />
        <div className="rounded-xl border-2 border-white/70 bg-black/35 px-3 py-1.5 text-right backdrop-blur-sm">
          <div className="text-xs opacity-90">Monuments</div>
          <div className="text-lg font-extrabold leading-tight">
            📷 {hud.discovered} / {hud.total}
          </div>
        </div>
      </div>

      <Toasts />
      <SheepDialog name={sheepName} />

      <div className="absolute bottom-3 right-3 hidden flex-col items-end gap-1 rounded-xl bg-black/30 px-3 py-2 text-white/95 backdrop-blur-sm sm:flex" style={{ display: device === 'touch' ? 'none' : undefined }}>
        {hud.hint === 'pet' && <Key action="confirm" label={`Caresser ${sheepName}`} />}
        {hud.hint === 'boat' && <Key action="vehicle" label="Mettre le currach à l’eau" />}
        <Key action="photo" label="Appareil photo" />
        <Key action="run" label="Galoper (maintenir)" />
        <Key action="vehicle" label="Véhicules" />
        <Key action="map" label="Carte" />
        <Key action="album" label="Album" />
      </div>
    </div>
  );
}

function timeIcon(h: number) {
  if (h >= 6.3 && h < 8.5) return '🌅';
  if (h >= 8.5 && h < 18.5) return '☀️';
  if (h >= 18.5 && h < 21) return '🌇';
  return '🌙';
}

/** Bande de boussole : les monuments apparaissent selon leur direction. */
function Compass() {
  const compass = useUi((s) => s.hud.compass);
  const FOV = Math.PI * 0.75;
  return (
    <div className="relative hidden h-12 w-[42vw] max-w-xl overflow-hidden rounded-xl border-2 border-white/70 bg-black/35 backdrop-blur-sm md:block">
      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/60" />
      {compass.map((c, i) => {
        if (Math.abs(c.angle) > FOV / 2) return null;
        const showLabel = i === compass.findIndex((k) => !k.done && Math.abs(k.angle) <= FOV / 2);
        const x = 50 - (c.angle / (FOV / 2)) * 50;
        return (
          <div key={c.id} className="absolute top-1 flex -translate-x-1/2 flex-col items-center" style={{ left: `${x}%` }}>
            <span className={`text-lg leading-none ${c.done ? 'opacity-60' : ''}`}>{c.done ? '✅' : '📍'}</span>
            {showLabel && <span className="max-w-32 truncate text-[10px] font-bold leading-tight">{Math.round(c.distance)} m</span>}
          </div>
        );
      })}
    </div>
  );
}

function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="absolute left-1/2 top-20 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="animate-[pop_.3s_ease-out] rounded-xl border-2 border-white bg-[#2f8f5b] px-4 py-2 text-center font-bold shadow-lg">
          {t.icon} {t.text}
        </div>
      ))}
    </div>
  );
}

/** Boîte de dialogue façon Pokémon pour les répliques du mouton. */
export function SheepDialog({ name }: { name: string }) {
  const bubble = useUi((s) => s.sheepBubble);
  const [, force] = useState(0);
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => force((n) => n + 1), Math.max(0, bubble.until - performance.now()) + 20);
    return () => clearTimeout(t);
  }, [bubble]);
  if (!bubble || performance.now() > bubble.until) return null;
  return (
    <div className="absolute bottom-4 left-1/2 w-[min(92vw,640px)] -translate-x-1/2">
      <div className="rounded-2xl border-4 border-[#3a3a3a] bg-white px-5 py-3 text-[#222] shadow-[0_5px_0_rgba(0,0,0,0.35)]">
        <div className="mb-0.5 text-sm font-black text-[#2f8f5b]">🐑 {name}</div>
        <div className="text-base font-bold sm:text-lg">{bubble.text}</div>
      </div>
    </div>
  );
}
