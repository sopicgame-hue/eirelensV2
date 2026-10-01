/**
 * Château d'Ashford (Mayo) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const ashfordCastle: LandmarkDef = {
  id: 'ashford_castle',
  name: "Château d'Ashford",
  county: 'Mayo',
  province: 'Connacht',
  category: 'patrimoine',
  lat: 53.5361,
  lon: -9.2836,
  description: "Un château victorien au bord du Lough Corrib, devenu hôtel de luxe.",
  funFact: "Le film L'Homme tranquille (1952), avec John Wayne, a été tourné dans le village voisin de Cong.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
