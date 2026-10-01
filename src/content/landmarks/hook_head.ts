/**
 * Phare de Hook Head (Wexford) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const hookHead: LandmarkDef = {
  id: 'hook_head',
  name: "Phare de Hook Head",
  county: 'Wexford',
  province: 'Leinster',
  category: 'phare',
  tier: 'bonus',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 52.1318,
  lon: -6.9342,
  description: "L'un des plus anciens phares en activité au monde.",
  funFact: "La tour actuelle a environ 800 ans ; des moines y entretenaient déjà un feu auparavant.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
