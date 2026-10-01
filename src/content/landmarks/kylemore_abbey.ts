/**
 * Abbaye de Kylemore (Galway) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const kylemoreAbbey: LandmarkDef = {
  id: 'kylemore_abbey',
  name: "Abbaye de Kylemore",
  county: 'Galway',
  province: 'Connacht',
  category: 'patrimoine',
  lat: 53.5615,
  lon: -9.889,
  description: "Un château néogothique au bord d'un lac du Connemara, devenu abbaye bénédictine.",
  funFact: "Il a été construit par Mitchell Henry, un riche médecin anglais, pour son épouse Margaret.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
