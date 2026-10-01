import React, { useState } from 'react';
import { getGame } from '../gameRef';
import { MenuItem, Panel } from '../components';
import { useMenuNav } from '../useGameInput';
import { toggleFullscreen } from '../fullscreen';

export function PauseMenu() {
  const game = getGame()!;
  const [, refresh] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const s = game.save.settings;
  const vol = (v: number) => `${'■'.repeat(Math.round(v * 5))}${'□'.repeat(5 - Math.round(v * 5))}`;
  const set = (p: Partial<typeof s>) => {
    game.updateSettings(p);
    refresh((n) => n + 1);
  };
  const items: { label: string; run?: () => void; left?: () => void; right?: () => void }[] = [
    { label: '▶ Reprendre', run: () => game.setScreen('play') },
    { label: '👕 Personnaliser', run: () => game.setScreen('customize') },
    { label: '📖 Album', run: () => game.setScreen('album') },
    { label: '🗺 Carte', run: () => game.setScreen('map') },
    // Échappatoire : coincé sur un îlot, perdu en mer… on rentre à la gare de la zone
    { label: '🚉 Retour à la gare', run: () => void game.returnToStation() },
    { label: '⛶ Plein écran', run: () => toggleFullscreen() },
    { label: `🎨 Qualité : ${s.quality === 'high' ? 'Haute' : 'Économie'}`, run: () => set({ quality: s.quality === 'high' ? 'low' : 'high' }), left: () => set({ quality: 'low' }), right: () => set({ quality: 'high' }) },
    {
      label: `🎵 Musique ${vol(s.musicVolume)}`,
      run: () => set({ musicVolume: s.musicVolume >= 0.99 ? 0 : Math.min(1, s.musicVolume + 0.2) }), // toucher = cran suivant, en boucle
      left: () => set({ musicVolume: Math.max(0, s.musicVolume - 0.2) }),
      right: () => set({ musicVolume: Math.min(1, s.musicVolume + 0.2) }),
    },
    {
      label: `🔊 Effets ${vol(s.sfxVolume)}`,
      run: () => set({ sfxVolume: s.sfxVolume >= 0.99 ? 0 : Math.min(1, s.sfxVolume + 0.2) }),
      left: () => set({ sfxVolume: Math.max(0, s.sfxVolume - 0.2) }),
      right: () => set({ sfxVolume: Math.min(1, s.sfxVolume + 0.2) }),
    },
    { label: `↕ Inverser l’axe vertical : ${s.invertY ? 'Oui' : 'Non'}`, run: () => set({ invertY: !s.invertY }) },
    { label: confirmReset ? '⚠ Confirmer : tout effacer ?' : '🗑 Effacer la partie', run: () => (confirmReset ? game.resetEverything() : setConfirmReset(true)) },
  ];
  const [index, setIndex] = useMenuNav(items.length, {
    onConfirm: (i) => items[i].run?.(),
    onBack: () => game.setScreen('play'),
    onLeft: (i) => items[i].left?.(),
    onRight: (i) => items[i].right?.(),
  });
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Panel title="Pause" className="w-[min(92vw,440px)]" onClose={() => game.setScreen('play')}>
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <MenuItem
              key={i}
              selected={i === index}
              onClick={() => {
                setIndex(i);
                (it.run ?? it.right)?.();
              }}
            >
              {it.label}
            </MenuItem>
          ))}
        </div>
        <div className="mt-3 text-xs opacity-75">◀ ▶ pour régler les curseurs</div>
      </Panel>
    </div>
  );
}
