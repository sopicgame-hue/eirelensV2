/**
 * Petits composants d'interface réutilisables (style "boîte de dialogue Pokémon").
 * Règle : toute nouvelle fenêtre utilise <Panel>, tout bouton affiché utilise <Key>.
 */
import React from 'react';
import type { Action } from '../input/bindings';
import { btn } from './buttonLabels';
import { useUi } from './uiStore';
import { getGame } from './gameRef';

/** Fenêtre standard. `onClose` ajoute un bouton ✕ (indispensable au tactile : pas de touche "retour"). */
export function Panel({ children, className = '', title, onClose }: { children: React.ReactNode; className?: string; title?: string; onClose?: () => void }) {
  return (
    <div className={`relative rounded-2xl border-4 border-white bg-[#1f3a2b]/95 text-white shadow-[0_6px_0_#0d1f16] ${className}`}>
      {title && <div className="rounded-t-xl bg-[#2f8f5b] px-4 py-2 pr-14 text-lg font-extrabold tracking-wide">{title}</div>}
      {onClose && (
        <button onClick={onClose} aria-label="Fermer" className="absolute right-2 top-1.5 z-10 h-9 w-9 rounded-full border-2 border-white bg-black/30 text-lg font-black leading-none">
          ✕
        </button>
      )}
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </div>
  );
}

/** Rappel de bouton. Cliquable/touchable : déclenche l'action (utile au tactile). */
export function Key({ action, label }: { action: Action; label?: string }) {
  const device = useUi((s) => s.device);
  return (
    <span className="pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap" onClick={() => getGame()?.input.tapAction(action)}>
      <span className="min-w-7 rounded-md border-2 border-white/80 bg-white/15 px-1.5 text-center text-xs font-black">{btn(device, action)}</span>
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

export function Stars({ n, max = 3, size = 'text-lg' }: { n: number; max?: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'text-yellow-300' : 'text-white/25'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function MenuItem({ selected, children, onClick, disabled }: { selected: boolean; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-base font-bold transition ${
        selected ? 'bg-white text-[#1f3a2b]' : 'bg-white/5 hover:bg-white/15'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`w-3 ${selected ? '' : 'opacity-0'}`}>▶</span>
      {children}
    </button>
  );
}

export function formatHour(h: number) {
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
