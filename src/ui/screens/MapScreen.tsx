/**
 * Carte de l'Irlande dessinée à partir des MÊMES données que le monde
 * (côtes, lacs, routes, villes) + monuments et position du joueur.
 * ◀ ▶ : parcourir les monuments.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import geo from '../../world/data/irelandGeo.json';
import { worldBounds, lonLatToWorld } from '../../world/geo';
import { getGame } from '../gameRef';
import { Panel, Key } from '../components';
import { useMenuNav } from '../useGameInput';
import { LANDMARKS } from '../../content/landmarks';
import { TOWNS } from '../../world/data/towns';

const W = 900;
let baseCache: HTMLCanvasElement | null = null;

function project() {
  const b = worldBounds();
  const scale = W / (b.maxX - b.minX);
  const H = Math.round((b.maxZ - b.minZ) * scale);
  return { scale, H, toPx: (x: number, z: number) => [(x - b.minX) * scale, (z - b.minZ) * scale] as const };
}

function drawBase(): HTMLCanvasElement {
  if (baseCache) return baseCache;
  const { H, toPx } = project();
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5fb6d6';
  ctx.fillRect(0, 0, W, H);
  const poly = (flat: number[], fill: string, stroke?: string) => {
    ctx.beginPath();
    for (let i = 0; i < flat.length; i += 2) {
      const w = lonLatToWorld(flat[i], flat[i + 1]);
      const [px, py] = toPx(w.x, w.z);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  const g = geo as { land: number[][]; lakes: { ring: number[] }[] };
  g.land.forEach((r) => poly(r, '#86c95a', '#f5f1e6'));
  g.lakes.forEach((l) => poly(l.ring, '#5fb6d6'));
  const game = getGame();
  if (game) {
    ctx.strokeStyle = 'rgba(80,70,60,0.55)';
    ctx.lineWidth = 1.5;
    for (const r of game.grid.routeRanges) {
      ctx.beginPath();
      for (let n = r.start; n < r.end; n += 4) {
        const s = game.grid.roadSamples[n];
        const [px, py] = toPx(s.x, s.z);
        if (n === r.start) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#2b2b2b';
  ctx.font = 'bold 11px Nunito, sans-serif';
  for (const t of TOWNS) {
    if (t.size < 2) continue;
    const w = lonLatToWorld(t.lon, t.lat);
    const [px, py] = toPx(w.x, w.z);
    ctx.fillRect(px - 3, py - 3, 6, 6);
    ctx.fillText(t.name, px + 5, py - 4);
  }
  baseCache = c;
  return c;
}

export function MapScreen() {
  const game = getGame()!;
  const ref = useRef<HTMLCanvasElement>(null);
  useMenuNav(LANDMARKS.length, { columns: 1, onBack: () => game.setScreen('play'), onConfirm: () => game.setScreen('play'), onLeft: () => step(-1), onRight: () => step(1) });
  const sel = useRef(0);
  const step = (d: number) => {
    sel.current = (sel.current + d + LANDMARKS.length) % LANDMARKS.length;
    draw();
  };
  const { H, toPx } = useMemo(project, []);

  const draw = () => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(drawBase(), 0, 0);
    LANDMARKS.forEach((l, i) => {
      const w = lonLatToWorld(l.lon, l.lat);
      const [px, py] = toPx(w.x, w.z);
      const done = !!game.save.landmarks[l.id];
      ctx.beginPath();
      ctx.arc(px, py, i === sel.current ? 9 : 6, 0, Math.PI * 2);
      ctx.fillStyle = done ? '#f2c94c' : '#e94f4f';
      ctx.fill();
      ctx.lineWidth = i === sel.current ? 3 : 1.5;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    });
    const p = game.player.pos;
    const [px, py] = toPx(p.x, p.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-game.player.heading + Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 9);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fillStyle = '#1f6fb2';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    setInfo();
  };
  const infoRef = useRef<HTMLDivElement>(null);
  const setInfo = () => {
    const l = LANDMARKS[sel.current];
    const w = lonLatToWorld(l.lon, l.lat);
    const d = Math.hypot(w.x - game.player.pos.x, w.z - game.player.pos.z);
    const rec = game.save.landmarks[l.id];
    if (infoRef.current)
      infoRef.current.innerHTML = `<div class="text-lg font-black">${rec ? l.name : '??? (' + l.county + ')'}</div><div class="text-sm opacity-85">${Math.round(d)} m · ${rec ? '★'.repeat(rec.stars) : 'non photographié'}${l.requires === 'boat' ? ' · 🛶 bateau' : ''}</div>`;
  };
  useEffect(() => {
    // Monument le plus proche sélectionné par défaut
    let best = 0;
    let bd = Infinity;
    LANDMARKS.forEach((l, i) => {
      const w = lonLatToWorld(l.lon, l.lat);
      const d = Math.hypot(w.x - game.player.pos.x, w.z - game.player.pos.z);
      if (d < bd && !game.save.landmarks[l.id]) {
        bd = d;
        best = i;
      }
    });
    sel.current = best;
    draw();
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
      <Panel title="Carte" className="flex max-h-[96vh] flex-col" onClose={() => game.setScreen('play')}>
        <canvas ref={ref} width={W} height={H} className="max-h-[70vh] w-auto rounded-lg" style={{ aspectRatio: `${W}/${H}` }} />
        <div className="mt-2 flex items-center justify-between gap-4">
          <div ref={infoRef} />
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full border-2 border-white bg-white/10 text-lg font-black" onClick={() => step(-1)}>
              ◀
            </button>
            <button className="h-10 w-10 rounded-full border-2 border-white bg-white/10 text-lg font-black" onClick={() => step(1)}>
              ▶
            </button>
            <Key action="back" label="Fermer" />
          </div>
        </div>
      </Panel>
    </div>
  );
}
