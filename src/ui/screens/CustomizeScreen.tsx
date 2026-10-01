/**
 * Personnalisation : ▲▼ choisir la ligne, ◀ ▶ changer la valeur.
 * Le personnage se met à jour en direct dans le monde (caméra rapprochée).
 */
import React, { useState } from 'react';
import { getGame } from '../gameRef';
import { Panel } from '../components';
import { useMenuNav } from '../useGameInput';
import {
  Customization,
  BODY_OPTIONS,
  HAIR_STYLES,
  HATS,
  SHEEP_ACCESSORIES,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTH_COLORS,
} from '../../content/customization';

type Row = { label: string; key: keyof Customization; values: readonly (string | number)[]; display: (v: any) => React.ReactNode };

const swatch = (c: number) => <span className="inline-block h-5 w-8 rounded border-2 border-white" style={{ background: `#${c.toString(16).padStart(6, '0')}` }} />;

const ROWS: Row[] = [
  { label: 'Silhouette', key: 'body', values: BODY_OPTIONS.map((o) => o.id), display: (v) => BODY_OPTIONS.find((o) => o.id === v)?.label },
  { label: 'Peau', key: 'skin', values: SKIN_TONES, display: swatch },
  { label: 'Coiffure', key: 'hairStyle', values: HAIR_STYLES.map((h) => h.id), display: (v) => HAIR_STYLES.find((h) => h.id === v)?.label },
  { label: 'Cheveux', key: 'hairColor', values: HAIR_COLORS, display: swatch },
  { label: 'Haut', key: 'top', values: CLOTH_COLORS, display: swatch },
  { label: 'Bas', key: 'bottom', values: CLOTH_COLORS, display: swatch },
  { label: 'Chaussures', key: 'shoes', values: CLOTH_COLORS, display: swatch },
  { label: 'Chapeau', key: 'hat', values: HATS.map((h) => h.id), display: (v) => HATS.find((h) => h.id === v)?.label },
  { label: 'Couleur chapeau', key: 'hatColor', values: CLOTH_COLORS, display: swatch },
  { label: 'Accessoire du mouton', key: 'sheepAccessory', values: SHEEP_ACCESSORIES.map((a) => a.id), display: (v) => SHEEP_ACCESSORIES.find((a) => a.id === v)?.label },
  { label: 'Couleur accessoire', key: 'sheepAccessoryColor', values: CLOTH_COLORS, display: swatch },
];

export function CustomizeScreen() {
  const game = getGame()!;
  const [c, setC] = useState<Customization>({ ...game.save.customization });
  const [name, setName] = useState(game.save.sheepName);

  const cycle = (rowIndex: number, dir: number) => {
    const row = ROWS[rowIndex];
    if (!row) return;
    const list = row.values;
    const cur = list.indexOf(c[row.key] as never);
    const next = list[(cur + dir + list.length) % list.length];
    const nc = { ...c, [row.key]: next } as Customization;
    setC(nc);
    game.applyCustomization(nc, name);
  };
  const finish = () => {
    game.applyCustomization(c, name);
    game.setScreen('play');
  };
  const count = ROWS.length + 1;
  const [index, setIndex] = useMenuNav(count, {
    onLeft: (i) => cycle(i, -1),
    onRight: (i) => cycle(i, 1),
    onConfirm: (i) => (i === ROWS.length ? finish() : cycle(i, 1)),
    onBack: finish,
  });

  return (
    <div className="absolute inset-0 flex items-center justify-end p-4">
      <Panel title="Ton personnage" className="max-h-[92vh] w-[min(94vw,420px)] overflow-y-auto">
        <div className="flex flex-col gap-1">
          {ROWS.map((row, i) => (
            <div key={row.key} onClick={() => setIndex(i)} className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${i === index ? 'bg-white text-[#1f3a2b]' : ''}`}>
              <span className="text-sm font-bold">{row.label}</span>
              <span className="flex items-center gap-2">
                <button className="px-2 text-lg font-black" onClick={() => cycle(i, -1)}>
                  ◀
                </button>
                <span className="min-w-24 text-center text-sm font-bold">{row.display(c[row.key])}</span>
                <button className="px-2 text-lg font-black" onClick={() => cycle(i, 1)}>
                  ▶
                </button>
              </span>
            </div>
          ))}
          <label className="mt-2 flex items-center justify-between gap-2 px-3 text-sm font-bold">
            Nom du mouton
            <input
              value={name}
              maxLength={14}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => game.applyCustomization(c, name)}
              className="w-36 rounded-md border-2 border-white bg-white/10 px-2 py-1 text-white outline-none"
            />
          </label>
          <button
            onClick={finish}
            className={`mt-3 rounded-xl px-4 py-2.5 text-lg font-black ${index === ROWS.length ? 'bg-[#9bd35a] text-[#1f3a2b]' : 'bg-white/15'}`}
          >
            C’est parti !
          </button>
        </div>
      </Panel>
    </div>
  );
}
