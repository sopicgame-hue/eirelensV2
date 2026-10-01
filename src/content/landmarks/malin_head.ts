/**
 * Malin Head (Donegal) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const malinHead: LandmarkDef = {
  id: 'malin_head',
  name: "Malin Head",
  county: 'Donegal',
  province: 'Ulster',
  category: 'nature',
  tier: 'bonus',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 55.379,
  lon: -7.3763,
  description: "Le point le plus au nord de l'île d'Irlande.",
  funFact: "De grandes lettres « EIRE » en pierre y signalaient aux avions de la Seconde Guerre mondiale qu'ils survolaient un pays neutre.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
