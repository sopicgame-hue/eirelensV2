/**
 * Benbulbin (Sligo) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const benbulbin: LandmarkDef = {
  id: 'benbulbin',
  name: "Benbulbin",
  county: 'Sligo',
  province: 'Connacht',
  category: 'nature',
  lat: 54.367,
  lon: -8.4725,
  description: "Un plateau calcaire à la silhouette de table, sculpté par les glaciers.",
  funFact: "Le poète W. B. Yeats est enterré à Drumcliff, au pied de la montagne.",
  status: 'placeholder',
  photo: { focus: [0, 4, 0], radius: 45, minDistance: 60, maxDistance: 650 },
  clearRadius: 10,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
