/**
 * Viseur de l'appareil photo + flash + aperçu de la dernière photo prise.
 */
import { ECONOMY } from '../config/gameConfig';
import React, { useEffect, useState } from 'react';
import { useUi, uiStore } from './uiStore';
import { Key, Stars } from './components';

export function PhotoOverlay() {
  const photo = useUi((s) => s.photo);
  const [flashOn, setFlashOn] = useState(false);
  useEffect(() => {
    if (!photo.flash) return;
    setFlashOn(true);
    const t = setTimeout(() => setFlashOn(false), 140);
    return () => clearTimeout(t);
  }, [photo.flash]);

  const zoom = (50 / photo.fov).toFixed(1);
  const t = photo.target;
  return (
    <div className="pointer-events-none absolute inset-0 select-none text-white">
      {/* Coins du viseur */}
      <div className="absolute inset-[6%] rounded-3xl border-[3px] border-white/70" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80" />
      <div className="absolute left-[calc(100%/3)] top-[6%] h-[88%] w-px bg-white/25" />
      <div className="absolute left-[calc(200%/3)] top-[6%] h-[88%] w-px bg-white/25" />
      <div className="absolute left-[6%] top-[calc(100%/3)] h-px w-[88%] bg-white/25" />
      <div className="absolute left-[6%] top-[calc(200%/3)] h-px w-[88%] bg-white/25" />

      <div className="absolute left-[8%] top-[8%] rounded-lg bg-black/40 px-3 py-1 text-sm font-bold">
        🔴 PHOTO · x{zoom}
      </div>
      <div className="absolute right-[8%] top-[8%] max-w-[50%] rounded-lg bg-black/45 px-3 py-1.5 text-right">
        {t ? (
          <>
            <div className="text-sm font-extrabold">{t.name}</div>
            <div className="mt-1 h-2 w-40 overflow-hidden rounded bg-white/25">
              <div className="h-full bg-yellow-300 transition-all" style={{ width: `${Math.round(t.quality * 100)}%` }} />
            </div>
          </>
        ) : (
          <div className="text-sm opacity-80">Aucun monument dans le cadre</div>
        )}
      </div>
      <div className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-4 rounded-xl bg-black/40 px-4 py-2">
        <Key action="shutter" label="Déclencher" />
        <ZoomKeys />
        <Key action="back" label="Ranger" />
      </div>
      {flashOn && <div className="absolute inset-0 bg-white" />}
      <LastPhotoCard />
    </div>
  );
}

function ZoomKeys() {
  const device = useUi((s) => s.device);
  const [a, b] = device === 'gamepad' ? ['RT', 'LT'] : device === 'touch' ? ['+', '−'] : ['E / molette', 'A'];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="rounded-md border-2 border-white/80 bg-white/15 px-1.5 text-xs font-black">{a}</span>
      <span className="rounded-md border-2 border-white/80 bg-white/15 px-1.5 text-xs font-black">{b}</span>
      Zoom
    </span>
  );
}

export function LastPhotoCard() {
  const last = useUi((s) => s.lastPhoto);
  useEffect(() => {
    if (!last) return;
    const t = setTimeout(() => uiStore.set({ lastPhoto: null }), 3800);
    return () => clearTimeout(t);
  }, [last]);
  if (!last) return null;
  return (
    <div className="absolute bottom-[14%] right-[8%] w-56 rotate-2 animate-[pop_.35s_ease-out] rounded-md bg-white p-2 pb-3 text-[#222] shadow-2xl">
      <img src={last.dataUrl} className="w-full rounded-sm" alt="" />
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-extrabold">{last.title}</span>
        <Stars n={last.stars} size="text-base" />
      </div>
      {last.isNew && <div className="text-xs font-black text-[#2f8f5b]">NOUVEAU LIEU !</div>}
      {last.earned > 0 && (
        <div className="text-sm font-black text-[#b8860b]">
          +{last.earned} {ECONOMY.ICON} {last.isNew ? '' : '(meilleure photo)'}
        </div>
      )}
      {last.withSheep && <div className="text-xs font-bold text-[#8e44ad]">🐑 Avec la participation de ton mouton</div>}
    </div>
  );
}
