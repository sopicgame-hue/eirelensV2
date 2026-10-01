/**
 * Album façon Pokédex : un onglet par ZONE (lieux triés ☆ principaux, ◉ secondaires,
 * ♥ bonus) + un onglet "Pellicule" (toutes les photos prises).
 * LB/RB (touches A/E) change d'onglet.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { getGame } from '../gameRef';
import { Panel, Stars } from '../components';
import { useGameAction, useMenuNav } from '../useGameInput';
import { LANDMARKS } from '../../content/landmarks';
import { LandmarkDef, TIERS } from '../../content/landmarks/types';
import { listPhotos, PhotoRecord } from '../../core/photoStore';
import { ECONOMY } from '../../config/gameConfig';
import type { ZoneDef } from '../../world/data/zones';

const CATEGORY_ICON: Record<string, string> = { nature: '🌿', monument: '🏛', patrimoine: '🏰', ville: '🏙', phare: '🗼' };

/** Tous les lieux, triés par zone puis par importance : c'est la numérotation de l'album. */
function sortedLandmarks() {
  const game = getGame()!;
  const order = new Map(game.zones.ordered.map((z, i) => [z.id, i]));
  return LANDMARKS.map((def, i) => ({ def, i, zone: game.progression.zoneOf(def.id) })).sort(
    (a, b) => (order.get(a.zone) ?? 9) - (order.get(b.zone) ?? 9) || TIERS[a.def.tier].order - TIERS[b.def.tier].order || a.i - b.i,
  );
}

export function AlbumScreen() {
  const game = getGame()!;
  const zones = game.zones.ordered;
  const [tab, setTab] = useState(0); // 0..zones.length-1 = zones ; zones.length = pellicule
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  useEffect(() => {
    listPhotos().then(setPhotos);
  }, []);
  const nTabs = zones.length + 1;
  useGameAction((a) => {
    if (a === 'tabLeft') setTab((t) => (t - 1 + nTabs) % nTabs);
    if (a === 'tabRight') setTab((t) => (t + 1) % nTabs);
  });
  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const all = useMemo(sortedLandmarks, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
      <Panel className="flex h-[min(92vh,720px)] w-[min(96vw,1100px)] flex-col" onClose={() => game.setScreen('play')}>
        <div className="mb-3 mr-10 flex flex-wrap items-center gap-1.5">
          {zones.map((z, i) => (
            <button key={z.id} onClick={() => setTab(i)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-extrabold ${tab === i ? 'bg-white text-[#1f3a2b]' : 'bg-white/10'}`}>
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-white" style={{ background: z.color }} />
              {game.zones.isOpen(z.id) ? '' : '🔒 '}
              {z.name}
            </button>
          ))}
          <button onClick={() => setTab(zones.length)} className={`rounded-xl px-3 py-1.5 text-sm font-extrabold ${tab === zones.length ? 'bg-white text-[#1f3a2b]' : 'bg-white/10'}`}>
            🎞 Pellicule ({photos.length})
          </button>
          <div className="ml-auto text-sm opacity-80">
            📷 {game.progression.discovered}/{LANDMARKS.length} · {ECONOMY.ICON} {game.progression.money} · 🐑 {game.save.stats.sheepPhotos}
          </div>
        </div>
        {tab < zones.length ? <LandmarkGrid key={zones[tab].id} zone={zones[tab]} all={all} byId={byId} /> : <Film photos={photos} />}
      </Panel>
    </div>
  );
}

function LandmarkGrid({ zone, all, byId }: { zone: ZoneDef; all: { def: LandmarkDef; zone: string }[]; byId: Map<string, PhotoRecord> }) {
  const game = getGame()!;
  const COLS = 6;
  const list = all.map((x, n) => ({ ...x, n })).filter((x) => x.zone === zone.id);
  const st = game.progression.zoneStatus(zone.id);
  const open = game.zones.isOpen(zone.id);
  const prev = game.progression.previousZone(zone.id);
  const [index, setIndex] = useMenuNav(Math.max(1, list.length), { columns: COLS, onBack: () => game.setScreen('play') });
  if (list.length === 0) return <div className="flex flex-1 items-center justify-center opacity-75">Aucun lieu dans cette zone pour l’instant.</div>;
  const sel = list[Math.min(index, list.length - 1)];
  const rec = game.save.landmarks[sel.def.id];
  const selPhoto = rec ? byId.get(rec.photoId) : undefined;
  const reveal = !!rec || sel.def.tier === 'principal'; // les objectifs principaux sont toujours nommés
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="rounded-lg bg-black/25 px-3 py-1.5 text-sm font-bold">
        {open ? (
          <>
            ☆ Lieux principaux : {st.principalsDone}/{st.principalsTotal}
            {st.principalsDone >= st.principalsTotal ? ' — zone terminée ✔' : ' — photographie-les tous pour ouvrir la zone suivante'}
          </>
        ) : (
          <span className="text-yellow-300">🔒 Zone verrouillée{prev ? ` — termine les lieux ☆ de « ${prev.name} » pour l’ouvrir` : ''}</span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 gap-4">
        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
          {list.map((l, i) => {
            const r = game.save.landmarks[l.def.id];
            const ph = r ? byId.get(r.photoId) : undefined;
            return (
              <button
                key={l.def.id}
                ref={i === index ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                onClick={() => setIndex(i)}
                className={`relative aspect-square overflow-hidden rounded-xl border-4 ${i === index ? 'border-yellow-300' : 'border-white/30'} bg-black/30`}
              >
                {ph ? <img src={ph.dataUrl} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-3xl opacity-40">{r ? '📷' : '?'}</div>}
                <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold">#{String(l.n + 1).padStart(2, '0')}</div>
                <div className={`absolute right-1 top-1 rounded px-1 text-xs font-black ${l.def.tier === 'principal' ? 'bg-yellow-300 text-[#1f3a2b]' : 'bg-black/60'}`}>{TIERS[l.def.tier].icon}</div>
                {r && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-center">
                    <Stars n={r.stars} size="text-xs" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="hidden w-80 shrink-0 flex-col gap-2 overflow-y-auto rounded-xl bg-black/25 p-3 md:flex">
          {selPhoto && <img src={selPhoto.dataUrl} className="w-full rounded-lg" alt="" />}
          <div className="text-xs font-bold opacity-75">
            #{String(sel.n + 1).padStart(2, '0')} · {CATEGORY_ICON[sel.def.category]} {sel.def.county} ({sel.def.province})
          </div>
          <div className="text-xs font-black">
            {TIERS[sel.def.tier].icon} {TIERS[sel.def.tier].label} · jusqu’à {game.progression.reward(sel.def, 3)} {ECONOMY.ICON}
          </div>
          <div className="text-xl font-black leading-tight">{reveal ? sel.def.name : '???'}</div>
          {rec && <Stars n={rec.stars} />}
          <p className="text-sm leading-snug">{sel.def.description}</p>
          {rec ? (
            <p className="rounded-lg bg-white/10 p-2 text-sm italic leading-snug">💡 {sel.def.funFact}</p>
          ) : (
            <p className="text-sm opacity-80">Photographie ce lieu pour en apprendre plus. {sel.def.requires === 'boat' ? '🛶 Accessible uniquement en bateau.' : ''}</p>
          )}
          {sel.def.status === 'placeholder' && <p className="text-xs opacity-60">(Modèle 3D provisoire)</p>}
        </div>
      </div>
    </div>
  );
}

function Film({ photos }: { photos: PhotoRecord[] }) {
  const game = getGame()!;
  const COLS = 4;
  const [index, setIndex] = useMenuNav(Math.max(1, photos.length), { columns: COLS, onBack: () => game.setScreen('play') });
  if (photos.length === 0) return <div className="flex flex-1 items-center justify-center opacity-75">Aucune photo pour l’instant. Appuie sur le bouton photo !</div>;
  const sel = photos[Math.min(index, photos.length - 1)];
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            ref={i === index ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
            onClick={() => setIndex(i)}
            className={`overflow-hidden rounded-lg border-4 ${i === index ? 'border-yellow-300' : 'border-white/20'}`}
          >
            <img src={p.dataUrl} className="w-full" alt="" />
          </button>
        ))}
      </div>
      <div className="hidden w-80 shrink-0 flex-col gap-2 md:flex">
        <img src={sel.dataUrl} className="w-full rounded-lg" alt="" />
        <div className="text-lg font-black">{sel.title}</div>
        <Stars n={sel.stars} />
        <div className="text-sm opacity-80">
          {new Date(sel.date).toLocaleDateString('fr-FR')} · {Math.floor(sel.hour)}h{String(Math.floor((sel.hour % 1) * 60)).padStart(2, '0')} {sel.withSheep ? '· 🐑' : ''}
        </div>
      </div>
    </div>
  );
}
