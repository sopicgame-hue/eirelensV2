/**
 * Château de Bunratty (Clare) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const bunrattyCastle: LandmarkDef = {
  id: 'bunratty_castle',
  name: "Château de Bunratty",
  county: 'Clare',
  province: 'Munster',
  category: 'patrimoine',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 52.693,
  lon: -8.8114,
  description: "Une tour-maison du XVe siècle entièrement restaurée, avec son village folklorique.",
  funFact: "On y organise des banquets médiévaux depuis les années 1960.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
