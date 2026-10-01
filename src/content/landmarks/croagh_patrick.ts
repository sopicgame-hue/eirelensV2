/**
 * Croagh Patrick (Mayo) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const croaghPatrick: LandmarkDef = {
  id: 'croagh_patrick',
  name: "Croagh Patrick",
  county: 'Mayo',
  province: 'Connacht',
  category: 'nature',
  lat: 53.7597,
  lon: -9.6587,
  description: "Une montagne sacrée en forme de cône qui domine Clew Bay.",
  funFact: "Chaque dernier dimanche de juillet, des milliers de pèlerins en font l'ascension, certains pieds nus.",
  status: 'placeholder',
  photo: { focus: [0, 4, 0], radius: 45, minDistance: 60, maxDistance: 650 },
  clearRadius: 10,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
