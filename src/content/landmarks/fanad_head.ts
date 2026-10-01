/**
 * Phare de Fanad Head (Donegal) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const fanadHead: LandmarkDef = {
  id: 'fanad_head',
  name: "Phare de Fanad Head",
  county: 'Donegal',
  province: 'Ulster',
  category: 'phare',
  tier: 'bonus',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 55.265,
  lon: -7.6423,
  description: "Un phare blanc au bout d'une péninsule déchiquetée du Donegal.",
  funFact: "Il a été construit après le naufrage d'une frégate en 1811.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
