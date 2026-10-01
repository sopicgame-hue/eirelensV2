/**
 * Titanic Belfast (Antrim) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const titanicBelfast: LandmarkDef = {
  id: 'titanic_belfast',
  name: "Titanic Belfast",
  county: 'Antrim',
  province: 'Ulster',
  category: 'ville',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 54.6081,
  lon: -5.9187,
  description: "Un musée aux façades en forme de proue, sur le chantier naval du Titanic.",
  funFact: "Le Titanic a été construit juste à côté, dans les chantiers Harland & Wolff, et lancé en 1911.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
