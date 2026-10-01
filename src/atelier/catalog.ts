/**
 * Catalogue de l'ATELIER 3D : tout ce qui peut être inspecté seul, sans
 * parcourir l'Irlande (monuments, véhicules, gare, barrière de zone).
 * Un monument ou un véhicule ajouté aux registres apparaît ici automatiquement.
 */
import { LANDMARKS } from '../content/landmarks';
import { VEHICLES } from '../content/vehicles';
import { TIERS } from '../content/landmarks/types';

export type AtelierKind = 'landmark' | 'vehicle' | 'station' | 'gate';

export interface AtelierItem {
  kind: AtelierKind;
  id: string;
  label: string;
}

export function atelierCatalog(): AtelierItem[] {
  return [
    ...LANDMARKS.map((l) => ({ kind: 'landmark' as const, id: l.id, label: `${TIERS[l.tier].icon} ${l.name}${l.status === 'placeholder' ? ' (provisoire)' : ''}` })),
    ...VEHICLES.map((v) => ({ kind: 'vehicle' as const, id: v.id, label: `${v.icon} ${v.name}` })),
    { kind: 'station', id: 'station', label: '🚉 Gare (modèle commun)' },
    { kind: 'gate', id: 'gate', label: '🚧 Barrière "Zone verrouillée"' },
  ];
}

/** Lit ?atelier=landmark:fungie_dingle dans l'URL. */
export function atelierFromUrl(): { kind: AtelierKind; id: string } | null {
  const v = new URLSearchParams(window.location.search).get('atelier');
  if (!v || !v.includes(':')) return null;
  const [kind, id] = v.split(':');
  return { kind: kind as AtelierKind, id };
}

export function isAtelierMode() {
  return new URLSearchParams(window.location.search).has('atelier');
}
