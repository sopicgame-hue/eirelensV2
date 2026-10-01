/**
 * Interface de l'ATELIER 3D (voir Atelier.ts). Liste à gauche, modèle au centre,
 * options et informations en haut. Souris / doigt : tourner ; molette / pincer : zoom.
 * ← → : modèle précédent / suivant.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Atelier, AtelierInfo, AtelierOptions } from './Atelier';
import { atelierCatalog, atelierFromUrl } from './catalog';

export function AtelierView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atelier = useRef<Atelier | null>(null);
  const items = useMemo(atelierCatalog, []);
  const fromUrl = atelierFromUrl();
  const [index, setIndex] = useState(() => Math.max(0, items.findIndex((it) => fromUrl && it.kind === fromUrl.kind && it.id === fromUrl.id)));
  const [info, setInfo] = useState<AtelierInfo | null>(null);
  const [opts, setOpts] = useState<AtelierOptions>({ gauges: true, overlays: true, sea: false, speed: 0 });

  useEffect(() => {
    const a = new Atelier(canvasRef.current!);
    a.onInfo = setInfo;
    atelier.current = a;
    (window as unknown as { __atelier: Atelier }).__atelier = a; // pour la console
    return () => a.dispose();
  }, []);

  useEffect(() => {
    const a = atelier.current;
    if (!a) return;
    a.setOptions(opts);
    const it = items[index];
    a.show(it.kind, it.id);
    // Garde l'URL à jour : un simple rechargement réaffiche le même modèle
    const url = new URL(window.location.href);
    url.searchParams.set('atelier', `${it.kind}:${it.id}`);
    window.history.replaceState(null, '', url);
  }, [index, opts.sea]);

  useEffect(() => {
    atelier.current?.setOptions(opts);
  }, [opts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setIndex((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setIndex((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length]);

  const toggle = (k: 'gauges' | 'overlays' | 'sea') => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const isVehicle = items[index].kind === 'vehicle';

  return (
    <div className="relative flex h-full w-full bg-[#1f3a2b] font-[Nunito,system-ui,sans-serif] text-white">
      <div className="flex w-64 shrink-0 flex-col border-r-4 border-white/20">
        <div className="bg-[#2f8f5b] px-3 py-2 text-lg font-black">🛠 Atelier 3D</div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {items.map((it, i) => (
            <button
              key={`${it.kind}:${it.id}`}
              ref={i === index ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
              onClick={() => setIndex(i)}
              className={`block w-full truncate rounded-lg px-2 py-1 text-left text-sm font-bold ${i === index ? 'bg-white text-[#1f3a2b]' : 'hover:bg-white/10'}`}
            >
              {it.label}
            </button>
          ))}
        </div>
        <button className="m-2 rounded-xl border-2 border-white bg-white/10 px-3 py-2 font-black" onClick={() => (window.location.href = window.location.pathname)}>
          ◀ Retour au jeu
        </button>
      </div>
      <div className="relative min-w-0 flex-1">
        <canvas ref={canvasRef} className="block h-full w-full touch-none" />
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-col gap-2">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 text-sm font-bold">
            <Toggle on={opts.gauges} onClick={() => toggle('gauges')} label="🧍 Personnage + mouton (échelle)" />
            <Toggle on={opts.overlays} onClick={() => toggle('overlays')} label="🟥 Obstacles / 🟨 photo" />
            <Toggle on={opts.sea} onClick={() => toggle('sea')} label="🌊 Mer devant (+Z)" />
            {isVehicle && (
              <label className="flex items-center gap-2 rounded-lg bg-black/40 px-2 py-1">
                Vitesse {opts.speed}
                <input type="range" min={0} max={30} value={opts.speed} onChange={(e) => setOpts((o) => ({ ...o, speed: +e.target.value }))} />
              </label>
            )}
          </div>
          {info && (
            <div className="max-w-2xl rounded-xl bg-black/50 px-3 py-2 text-sm backdrop-blur-sm">
              <div className="text-lg font-black">{info.title}</div>
              {info.lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
              {info.warnings.map((w) => (
                <div key={w} className="font-black text-yellow-300">
                  ⚠ {w}
                </div>
              ))}
              <div className="mt-1 text-xs opacity-75">Quadrillage : 1 case = 1 u · ligne foncée = 10 u · flèche bleue = avant (+Z) · personnage = 1,6 u</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-lg border-2 px-2 py-1 ${on ? 'border-white bg-white text-[#1f3a2b]' : 'border-white/50 bg-black/40'}`}>
      {label}
    </button>
  );
}
