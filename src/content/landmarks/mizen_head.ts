/**
 * Mizen Head (Cork) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const mizenHead: LandmarkDef = {
  id: 'mizen_head',
  name: "Mizen Head",
  county: 'Cork',
  province: 'Munster',
  category: 'nature',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 51.455,
  lon: -9.8092,
  description: "La pointe sud-ouest de l'Irlande et sa passerelle au-dessus d'un ravin marin.",
  funFact: "Sa station de signalisation guidait les navires transatlantiques.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
