/**
 * Château de Ross (Kerry) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const rossCastle: LandmarkDef = {
  id: 'ross_castle',
  name: "Château de Ross",
  county: 'Kerry',
  province: 'Munster',
  category: 'patrimoine',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 52.0444,
  lon: -9.5168,
  description: "Une tour-maison du XVe siècle au bord du Lough Leane, à Killarney.",
  funFact: "Une prophétie disait qu'il ne tomberait que face à un navire : en 1652, les assaillants en ont fait venir un.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
