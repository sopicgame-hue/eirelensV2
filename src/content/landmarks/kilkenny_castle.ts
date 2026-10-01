/**
 * Château de Kilkenny (Kilkenny) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const kilkennyCastle: LandmarkDef = {
  id: 'kilkenny_castle',
  name: "Château de Kilkenny",
  county: 'Kilkenny',
  province: 'Leinster',
  category: 'patrimoine',
  lat: 52.6503,
  lon: -7.2492,
  description: "Un château normand du XIIe siècle au cœur de la ville médiévale.",
  funFact: "La famille Butler l'a possédé près de six siècles avant de le céder à la ville pour 50 £ en 1967.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
