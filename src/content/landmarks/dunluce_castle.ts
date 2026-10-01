/**
 * Château de Dunluce (Antrim) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const dunluceCastle: LandmarkDef = {
  id: 'dunluce_castle',
  name: "Château de Dunluce",
  county: 'Antrim',
  province: 'Ulster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 55.2081,
  lon: -6.5794,
  description: "Les ruines d'un château médiéval accroché au bord d'une falaise.",
  funFact: "D'après la légende, une partie des cuisines se serait effondrée dans la mer un soir de tempête.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
