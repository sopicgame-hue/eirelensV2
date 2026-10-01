/**
 * Temple de Mussenden (Londonderry) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const mussendenTemple: LandmarkDef = {
  id: 'mussenden_temple',
  name: "Temple de Mussenden",
  county: 'Londonderry',
  province: 'Ulster',
  category: 'patrimoine',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 55.1703,
  lon: -6.8115,
  description: "Un petit temple circulaire perché au bord d'une falaise face à l'océan.",
  funFact: "Il a été construit en 1785 pour servir de bibliothèque d'été.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
