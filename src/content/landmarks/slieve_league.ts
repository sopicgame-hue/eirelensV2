/**
 * Falaises de Slieve League (Donegal) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const slieveLeague: LandmarkDef = {
  id: 'slieve_league',
  name: "Falaises de Slieve League",
  county: 'Donegal',
  province: 'Ulster',
  category: 'nature',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 54.641,
  lon: -8.6654,
  description: "Parmi les plus hautes falaises maritimes d'Europe : plus de 600 m.",
  funFact: "Elles sont presque trois fois plus hautes que les Falaises de Moher.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
