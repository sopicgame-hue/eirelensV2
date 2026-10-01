/**
 * Hooks de navigation pour les menus (clavier, manette, tactile unifiés).
 *
 *   useGameAction((a) => { if (a === 'back') close(); })
 *   const [index, setIndex] = useMenuNav(items.length, { onConfirm, onBack, columns: 4 })
 */
import { useEffect, useRef, useState } from 'react';
import type { Action } from '../input/bindings';
import { getGame } from './gameRef';

export function useGameAction(handler: (a: Action) => void, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const game = getGame();
    if (!game) return;
    // Petit délai : évite que l'appui qui a OUVERT le menu soit aussi traité par le menu
    let armed = false;
    const t = setTimeout(() => (armed = true), 120);
    const off = game.input.onAction((a) => armed && ref.current(a));
    return () => {
      clearTimeout(t);
      off();
    };
  }, [active]);
}

export function useMenuNav(
  count: number,
  opts: { onConfirm?: (i: number) => void; onBack?: () => void; onLeft?: (i: number) => void; onRight?: (i: number) => void; columns?: number; initial?: number },
) {
  const [index, setIndex] = useState(opts.initial ?? 0);
  const cols = opts.columns ?? 1;
  useGameAction((a) => {
    const game = getGame();
    if (a === 'up') setIndex((i) => (i - cols + count) % count);
    else if (a === 'down') setIndex((i) => (i + cols) % count);
    else if (a === 'left') {
      if (opts.onLeft) opts.onLeft(index);
      else if (cols > 1) setIndex((i) => (i - 1 + count) % count);
    } else if (a === 'right') {
      if (opts.onRight) opts.onRight(index);
      else if (cols > 1) setIndex((i) => (i + 1) % count);
    } else if (a === 'confirm') opts.onConfirm?.(index);
    else if (a === 'back') opts.onBack?.();
    if (['up', 'down', 'left', 'right'].includes(a)) game?.audio.blip(990);
  });
  useEffect(() => {
    if (index >= count) setIndex(Math.max(0, count - 1));
  }, [count, index]);
  return [index, setIndex] as const;
}
