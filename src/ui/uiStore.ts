/**
 * Store de l'interface (React) — le pont entre le moteur et l'UI.
 *
 *   Côté moteur : uiStore.set({ ... })       (jamais plus de ~10 fois/s pour le HUD)
 *   Côté React  : const hud = useUi((s) => s.hud)
 *
 * Le moteur ne manipule JAMAIS le DOM directement : il écrit ici, React affiche.
 */
import { useSyncExternalStore } from 'react';

export type Screen = 'loading' | 'title' | 'play' | 'photo' | 'album' | 'map' | 'pause' | 'customize' | 'vehicles';

export interface Toast {
  id: number;
  text: string;
  icon?: string;
}

export interface UiState {
  screen: Screen;
  loading: { progress: number; label: string };
  hud: {
    region: string;
    hour: number;
    vehicleId: string;
    /** Monuments repérés devant le joueur, pour la boussole (angle relatif en radians). */
    compass: { id: string; name: string; angle: number; distance: number; done: boolean }[];
    discovered: number;
    total: number;
    /** Indication contextuelle ("A : caresser Paddy"…). */
    hint: string;
  };
  photo: {
    fov: number;
    /** Monument actuellement cadré, s'il est valide. */
    target: { name: string; quality: number } | null;
    flash: number;
  };
  lastPhoto: { dataUrl: string; title: string; stars: number; isNew: boolean; withSheep: boolean } | null;
  sheepBubble: { text: string; until: number } | null;
  toasts: Toast[];
  device: 'keyboard' | 'gamepad' | 'touch';
}

const initial: UiState = {
  screen: 'loading',
  loading: { progress: 0, label: 'Préparation…' },
  hud: { region: '', hour: 10, vehicleId: 'foot', compass: [], discovered: 0, total: 0, hint: '' },
  photo: { fov: 50, target: null, flash: 0 },
  lastPhoto: null,
  sheepBubble: null,
  toasts: [],
  device: 'keyboard',
};

let state: UiState = initial;
const subs = new Set<() => void>();
let toastId = 1;

export const uiStore = {
  get: () => state,
  set(partial: Partial<UiState>) {
    state = { ...state, ...partial };
    subs.forEach((s) => s());
  },
  patchHud(partial: Partial<UiState['hud']>) {
    uiStore.set({ hud: { ...state.hud, ...partial } });
  },
  toast(text: string, icon?: string, ms = 3500) {
    const t = { id: toastId++, text, icon };
    uiStore.set({ toasts: [...state.toasts, t].slice(-4) });
    setTimeout(() => uiStore.set({ toasts: state.toasts.filter((x) => x.id !== t.id) }), ms);
  },
  subscribe(cb: () => void) {
    subs.add(cb);
    return () => subs.delete(cb);
  },
};

export function useUi<T>(selector: (s: UiState) => T): T {
  return useSyncExternalStore(uiStore.subscribe, () => selector(state), () => selector(state));
}
