/**
 * Château de Dunguaire (Galway) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const dunguaireCastle: LandmarkDef = {
  id: 'dunguaire_castle',
  name: "Château de Dunguaire",
  county: 'Galway',
  province: 'Connacht',
  category: 'patrimoine',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 53.1475,
  lon: -8.9362,
  description: "Une tour-maison du XVIe siècle posée au bord de la baie de Galway.",
  funFact: "Au XXe siècle, il a accueilli des écrivains comme W. B. Yeats et George Bernard Shaw.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
