import React, { useState } from 'react';
import { getGame } from '../gameRef';
import { MenuItem, Panel } from '../components';
import { useMenuNav } from '../useGameInput';
import { VEHICLES, FOOT_ID } from '../../content/vehicles';

export function VehicleMenu() {
  const game = getGame()!;
  const [error, setError] = useState<string | null>(null);
  const discovered = game.progression.discovered;
  const items = [
    { id: FOOT_ID, icon: '🥾', name: 'À pied', description: 'Le meilleur moyen de profiter du paysage.', unlocked: true, unlockAt: 0 },
    ...VEHICLES.map((v) => ({ id: v.id, icon: v.icon, name: v.name, description: v.description, unlocked: game.progression.isUnlocked(v.id), unlockAt: v.unlockAt })),
  ];
  const choose = (i: number) => {
    const it = items[i];
    if (!it.unlocked) {
      setError(`Photographie encore ${it.unlockAt - discovered} monument(s) pour débloquer ce véhicule.`);
      return;
    }
    const err = game.selectVehicle(it.id);
    if (err) setError(err);
    else game.setScreen('play');
  };
  const [index, setIndex] = useMenuNav(items.length, { onConfirm: choose, onBack: () => game.setScreen('play') });
  const sel = items[index];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Panel title="Moyens de transport" className="w-[min(92vw,520px)]" onClose={() => game.setScreen('play')}>
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <MenuItem
              key={it.id}
              selected={i === index}
              disabled={!it.unlocked}
              onClick={() => {
                setIndex(i);
                choose(i);
              }}
            >
              <span className="text-2xl">{it.unlocked ? it.icon : '🔒'}</span>
              <span className="flex-1">{it.unlocked ? it.name : '???'}</span>
              {!it.unlocked && <span className="text-xs">📷 {it.unlockAt}</span>}
            </MenuItem>
          ))}
        </div>
        <div className="mt-3 min-h-12 rounded-xl bg-black/25 p-3 text-sm">
          {error ? <span className="font-bold text-yellow-300">{error}</span> : sel.unlocked ? sel.description : `Se débloque à ${sel.unlockAt} monuments photographiés.`}
        </div>
      </Panel>
    </div>
  );
}
