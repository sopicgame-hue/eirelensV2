/**
 * Gap of Dunloe (Kerry) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const gapOfDunloe: LandmarkDef = {
  id: 'gap_of_dunloe',
  name: "Gap of Dunloe",
  county: 'Kerry',
  province: 'Munster',
  category: 'nature',
  tier: 'secondaire',
  lat: 52.0333,
  lon: -9.6333,
  description: "Un col étroit creusé par les glaciers entre deux massifs.",
  funFact: "On le traverse traditionnellement à pied, à vélo… ou en jaunting car, une carriole tirée par un cheval.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
