/**
 * Pont de corde de Carrick-a-Rede (Antrim) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const carrickARede: LandmarkDef = {
  id: 'carrick_a_rede',
  name: "Pont de corde de Carrick-a-Rede",
  county: 'Antrim',
  province: 'Ulster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 55.2358,
  lon: -6.3371,
  description: "Une passerelle de corde suspendue à 30 m au-dessus de la mer, vers un îlot.",
  funFact: "Les pêcheurs de saumon l'utilisaient depuis plus de 250 ans.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
