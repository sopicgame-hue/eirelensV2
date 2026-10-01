/**
 * Carrauntoohil (Kerry) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const carrauntoohil: LandmarkDef = {
  id: 'carrauntoohil',
  name: "Carrauntoohil",
  county: 'Kerry',
  province: 'Munster',
  category: 'nature',
  tier: 'bonus',
  lat: 51.9993,
  lon: -9.7425,
  description: "Le plus haut sommet d'Irlande (1 038 m), au cœur des MacGillycuddy's Reeks.",
  funFact: "Une grande croix métallique se dresse à son sommet.",
  status: 'placeholder',
  photo: { focus: [0, 4, 0], radius: 45, minDistance: 60, maxDistance: 650 },
  clearRadius: 10,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
