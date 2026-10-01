/**
 * Clonmacnoise (Offaly) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const clonmacnoise: LandmarkDef = {
  id: 'clonmacnoise',
  name: "Clonmacnoise",
  county: 'Offaly',
  province: 'Leinster',
  category: 'patrimoine',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 53.3277,
  lon: -7.9858,
  description: "Un monastère du VIe siècle au bord du Shannon, avec tours rondes et hautes croix.",
  funFact: "Le pape Jean-Paul II s'y est rendu en 1979.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
