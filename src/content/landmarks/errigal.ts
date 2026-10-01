/**
 * Mont Errigal (Donegal) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const errigal: LandmarkDef = {
  id: 'errigal',
  name: "Mont Errigal",
  county: 'Donegal',
  province: 'Ulster',
  category: 'nature',
  lat: 55.0339,
  lon: -8.1131,
  description: "Un pic de quartzite conique, le plus haut du Donegal (751 m).",
  funFact: "Au coucher du soleil, son quartzite prend des reflets roses.",
  status: 'placeholder',
  photo: { focus: [0, 4, 0], radius: 45, minDistance: 60, maxDistance: 650 },
  clearRadius: 10,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
