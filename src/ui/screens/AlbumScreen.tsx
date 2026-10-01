/**
 * Album façon Pokédex : onglet "Monuments" (tous les lieux, découverts ou non)
 * et onglet "Pellicule" (toutes les photos prises). LB/RB (A/E) change d'onglet.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { getGame } from '../gameRef';
import { Panel, Stars } from '../components';
import { useGameAction, useMenuNav } from '../useGameInput';
import { LANDMARKS } from '../../content/landmarks';
import { listPhotos, PhotoRecord } from '../../core/photoStore';

const CATEGORY_ICON: Record<string, string> = { nature: '🌿', monument: '🏛', patrimoine: '🏰', ville: '🏙', phare: '🗼' };

export function AlbumScreen() {
  const game = getGame()!;
  const [tab, setTab] = useState<0 | 1>(0);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  useEffect(() => {
    listPhotos().then(setPhotos);
  }, []);
  useGameAction((a) => {
    if (a === 'tabLeft' || a === 'tabRight') setTab((t) => (t === 0 ? 1 : 0));
  });
  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
      <Panel className="flex h-[min(92vh,720px)] w-[min(96vw,1100px)] flex-col" onClose={() => game.setScreen('play')}>
        <div className="mb-3 flex items-center gap-2">
          {['📍 Monuments', `🎞 Pellicule (${photos.length})`].map((t, i) => (
            <button key={t} onClick={() => setTab(i as 0 | 1)} className={`rounded-xl px-4 py-1.5 font-extrabold ${tab === i ? 'bg-white text-[#1f3a2b]' : 'bg-white/10'}`}>
              {t}
            </button>
          ))}
          <div className="ml-auto mr-10 text-sm opacity-80">
            {game.progression.discovered} / {LANDMARKS.length} découverts · 🐑 {game.save.stats.sheepPhotos} photobombs
          </div>
        </div>
        {tab === 0 ? <LandmarkGrid byId={byId} /> : <Film photos={photos} />}
      </Panel>
    </div>
  );
}

function LandmarkGrid({ byId }: { byId: Map<string, PhotoRecord> }) {
  const game = getGame()!;
  const COLS = 6;
  const [index, setIndex] = useMenuNav(LANDMARKS.length, { columns: COLS, onBack: () => game.setScreen('play') });
  const sel = LANDMARKS[index];
  const rec = game.save.landmarks[sel.id];
  const selPhoto = rec ? byId.get(rec.photoId) : undefined;
  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
        {LANDMARKS.map((l, i) => {
          const r = game.save.landmarks[l.id];
          const ph = r ? byId.get(r.photoId) : undefined;
          return (
            <button
              key={l.id}
              ref={i === index ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border-4 ${i === index ? 'border-yellow-300' : 'border-white/30'} bg-black/30`}
            >
              {ph ? <img src={ph.dataUrl} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-3xl opacity-40">{r ? '📷' : '?'}</div>}
              <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold">#{String(i + 1).padStart(2, '0')}</div>
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
          #{String(index + 1).padStart(2, '0')} · {CATEGORY_ICON[sel.category]} {sel.county} ({sel.province})
        </div>
        <div className="text-xl font-black leading-tight">{rec ? sel.name : '???'}</div>
        {rec && <Stars n={rec.stars} />}
        <p className="text-sm leading-snug">{sel.description}</p>
        {rec ? (
          <p className="rounded-lg bg-white/10 p-2 text-sm italic leading-snug">💡 {sel.funFact}</p>
        ) : (
          <p className="text-sm opacity-80">Photographie ce lieu pour en apprendre plus. {sel.requires === 'boat' ? '🛶 Accessible uniquement en bateau.' : ''}</p>
        )}
        {sel.status === 'placeholder' && <p className="text-xs opacity-60">(Modèle 3D provisoire)</p>}
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
