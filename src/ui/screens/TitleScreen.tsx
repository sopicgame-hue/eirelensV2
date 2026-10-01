import React from 'react';
import { useUi } from '../uiStore';
import { getGame } from '../gameRef';
import { MenuItem } from '../components';
import { useMenuNav } from '../useGameInput';
import { hasSave } from '../../core/save';
import { toggleFullscreen } from '../fullscreen';

export function LoadingScreen() {
  const loading = useUi((s) => s.loading);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1f3a2b] text-white">
      <Logo />
      <div className="mt-8 h-3 w-72 overflow-hidden rounded-full border-2 border-white bg-black/30">
        <div className="h-full bg-[#9bd35a] transition-all" style={{ width: `${Math.round(loading.progress * 100)}%` }} />
      </div>
      <div className="mt-3 text-sm opacity-90">{loading.label}</div>
    </div>
  );
}

export function Logo() {
  return (
    <div className="text-center drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]">
      <div className="text-6xl font-black tracking-tight text-white sm:text-7xl">
        Eire<span className="text-[#9bd35a]">Lens</span>
      </div>
      <div className="mt-1 text-lg font-bold text-white/90">🐑 Balade photo en Irlande miniature 📷</div>
    </div>
  );
}

export function TitleScreen() {
  const canContinue = hasSave();
  const items = [
    ...(canContinue ? [{ label: '▶ Continuer', run: () => getGame()?.continueGame() }] : []),
    { label: '✨ Nouvelle partie', run: () => getGame()?.newGame() },
    { label: '⛶ Plein écran', run: () => toggleFullscreen() },
  ];
  const [index, setIndex] = useMenuNav(items.length, { onConfirm: (i) => items[i].run() });
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/10 via-black/0 to-black/50">
      <Logo />
      <div className="mt-10 flex w-72 flex-col gap-2 rounded-2xl border-4 border-white bg-[#1f3a2b]/90 p-3 text-white">
        {items.map((it, i) => (
          <MenuItem
            key={it.label}
            selected={i === index}
            onClick={() => {
              setIndex(i);
              it.run();
            }}
          >
            {it.label}
          </MenuItem>
        ))}
      </div>
      <div className="mt-6 text-center text-sm text-white/85 drop-shadow">
        Manette conseillée · Clavier : ZQSD/WASD + Espace · iPad : écran tactile ou manette Bluetooth
      </div>
    </div>
  );
}
