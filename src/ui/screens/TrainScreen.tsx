/**
 * Guichet de la gare : choisir sa destination. Les gares des zones fermées
 * sont grisées avec la condition d'ouverture. + TravelScreen (fondu pendant le trajet).
 */
import React from 'react';
import { getGame } from '../gameRef';
import { MenuItem, Panel } from '../components';
import { useMenuNav } from '../useGameInput';
import { useUi } from '../uiStore';

export function TrainScreen() {
  const game = getGame()!;
  const here = game.stations.nearest(game.player.pos.x, game.player.pos.z).station;
  const zones = game.zones.ordered;
  const items = zones.map((z) => {
    const open = game.zones.isOpen(z.id);
    const prev = game.progression.previousZone(z.id);
    const st = prev ? game.progression.zoneStatus(prev.id) : null;
    const lockText = !prev ? '' : game.zones.isOpen(prev.id) ? `☆ ${st!.principalsDone}/${st!.principalsTotal} lieux principaux de « ${prev.name} »` : `Ouvre d’abord « ${prev.name} »`;
    return { zone: z, open, here: z.id === here.zone, lockText };
  });
  const choose = (i: number) => {
    const it = items[i];
    if (!it.open || it.here) return;
    void game.takeTrain(it.zone.id);
  };
  const [index, setIndex] = useMenuNav(items.length, {
    onConfirm: choose,
    onBack: () => game.setScreen('play'),
    initial: Math.max(0, items.findIndex((it) => it.open && !it.here)),
  });
  const sel = items[index];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Panel title={`🚂 ${here.name}`} className="w-[min(92vw,560px)]" onClose={() => game.setScreen('play')}>
        <div className="mb-2 text-sm opacity-85">Où veux-tu aller ? Paddy a déjà son billet.</div>
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <MenuItem
              key={it.zone.id}
              selected={i === index}
              disabled={!it.open || it.here}
              onClick={() => {
                setIndex(i);
                choose(i);
              }}
            >
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white" style={{ background: it.zone.color }} />
              <span className="flex-1">
                <span className="block leading-tight">{it.zone.station.name}</span>
                <span className="block text-xs font-semibold opacity-75">{it.zone.name}</span>
              </span>
              <span className="text-sm">{it.here ? '📍 Vous êtes ici' : it.open ? 'Départ ▶' : '🔒'}</span>
            </MenuItem>
          ))}
        </div>
        <div className="mt-3 min-h-10 rounded-xl bg-black/25 p-3 text-sm">
          {sel.here ? 'Tu es déjà dans cette gare.' : sel.open ? `Prendre le train pour ${sel.zone.station.name}.` : <span className="font-bold text-yellow-300">🔒 Zone verrouillée — {sel.lockText}</span>}
        </div>
      </Panel>
    </div>
  );
}

/** Pendant le trajet : écran noir, petit train qui défile. */
export function TravelScreen() {
  const travel = useUi((s) => s.travel);
  return (
    <div className="absolute inset-0 flex animate-[fadein_.4s_ease-out] flex-col items-center justify-center gap-4 bg-[#0d1f16] text-white">
      <div className="relative h-14 w-[min(80vw,520px)] overflow-hidden">
        <div className="absolute bottom-2 left-0 right-0 h-1 rounded bg-white/30" />
        <div className="absolute bottom-3 animate-[train_2.4s_linear] text-4xl">🚂🚃🚃</div>
      </div>
      <div className="text-xl font-black">{travel ? `${travel.from} → ${travel.to}` : ''}</div>
      <div className="text-sm opacity-75">Paddy regarde défiler les prés…</div>
    </div>
  );
}
