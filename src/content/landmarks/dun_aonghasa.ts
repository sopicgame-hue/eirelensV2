/**
 * Dún Aonghasa (Galway) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const dunAonghasa: LandmarkDef = {
  id: 'dun_aonghasa',
  name: "Dún Aonghasa",
  county: 'Galway',
  province: 'Connacht',
  category: 'patrimoine',
  tier: 'secondaire',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 53.1271,
  lon: -9.7676,
  requires: 'boat',
  description: "Un fort préhistorique en pierre sèche au bord d'une falaise de 100 m, sur Inis Mór.",
  funFact: "Ses murs semi-circulaires ont environ 3 000 ans.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
