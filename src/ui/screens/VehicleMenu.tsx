/**
 * Garage : choisir son moyen de transport, ou ACHETER un véhicule avec ses pièces.
 * Premier appui sur un véhicule non possédé = demande de confirmation, second = achat.
 */
import React, { useEffect, useState } from 'react';
import { getGame } from '../gameRef';
import { MenuItem, Panel } from '../components';
import { useMenuNav } from '../useGameInput';
import { VEHICLES, FOOT_ID } from '../../content/vehicles';
import { ECONOMY } from '../../config/gameConfig';

export function VehicleMenu() {
  const game = getGame()!;
  // Message lié à un véhicule précis (il disparaît quand on en sélectionne un autre)
  const [msg, setMsg] = useState<{ id: string; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, refresh] = useState(0);
  const money = game.progression.money;
  const items = [
    { id: FOOT_ID, icon: '🥾', name: 'À pied', description: 'Le meilleur moyen de profiter du paysage.', owned: true, price: 0 },
    ...VEHICLES.map((v) => ({ id: v.id, icon: v.icon, name: v.name, description: v.description, owned: game.progression.owns(v.id), price: v.price })),
  ];
  const choose = (i: number) => {
    const it = items[i];
    const setMessage = (text: string) => setMsg({ id: it.id, text });
    if (!it.owned) {
      if (money < it.price) {
        setConfirmId(null);
        setMessage(`Il te manque ${it.price - money} ${ECONOMY.CURRENCY}. Photographie de nouveaux lieux pour en gagner !`);
        return;
      }
      if (confirmId !== it.id) {
        setConfirmId(it.id);
        setMessage(`Acheter ${it.name} pour ${it.price} ${ECONOMY.ICON} ? Appuie encore pour confirmer.`);
        return;
      }
      const err = game.buyVehicle(it.id);
      setConfirmId(null);
      setMessage(err ?? `${it.name} est à toi ! Appuie encore pour l’utiliser.`);
      refresh((n) => n + 1);
      return;
    }
    setConfirmId(null);
    const err = game.selectVehicle(it.id);
    if (err) setMessage(err);
    else game.setScreen('play');
  };
  const [index, setIndex] = useMenuNav(items.length, {
    onConfirm: choose,
    onBack: () => game.setScreen('play'),
  });
  // Changer de ligne annule une confirmation d'achat en attente
  useEffect(() => {
    if (confirmId && confirmId !== items[index].id) setConfirmId(null);
  }, [index]);
  const sel = items[index];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Panel title="Moyens de transport" className="w-[min(92vw,540px)]" onClose={() => game.setScreen('play')}>
        <div className="mb-2 flex justify-end text-lg font-black">
          {ECONOMY.ICON} {money} <span className="ml-1 self-end text-xs font-bold opacity-75">{ECONOMY.CURRENCY}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <MenuItem
              key={it.id}
              selected={i === index}
              disabled={!it.owned && money < it.price}
              onClick={() => {
                setIndex(i);
                choose(i);
              }}
            >
              <span className="text-2xl">{it.icon}</span>
              <span className="flex-1">{it.name}</span>
              {!it.owned && (
                <span className={`rounded-lg px-2 py-0.5 text-sm ${money >= it.price ? 'bg-yellow-300 text-[#1f3a2b]' : 'bg-black/30'}`}>
                  {ECONOMY.ICON} {it.price}
                </span>
              )}
            </MenuItem>
          ))}
        </div>
        <div className="mt-3 min-h-12 rounded-xl bg-black/25 p-3 text-sm">
          {msg && msg.id === sel.id ? <span className="font-bold text-yellow-300">{msg.text}</span> : sel.description}
        </div>
      </Panel>
    </div>
  );
}
