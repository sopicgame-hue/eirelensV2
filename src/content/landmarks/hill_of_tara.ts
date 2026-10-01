/**
 * Colline de Tara (Meath) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const hillOfTara: LandmarkDef = {
  id: 'hill_of_tara',
  name: "Colline de Tara",
  county: 'Meath',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'secondaire',
  lat: 53.5797,
  lon: -6.6119,
  description: "L'ancien siège des Grands Rois d'Irlande.",
  funFact: "La Lia Fáil, la « pierre du destin », aurait crié lors du couronnement du roi légitime.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
