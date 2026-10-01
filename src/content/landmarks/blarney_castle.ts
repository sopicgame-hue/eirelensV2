/**
 * Château de Blarney (Cork) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const blarneyCastle: LandmarkDef = {
  id: 'blarney_castle',
  name: "Château de Blarney",
  county: 'Cork',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  lat: 51.9291,
  lon: -8.5709,
  description: "Un donjon du XVe siècle célèbre pour sa pierre magique.",
  funFact: "Embrasser la Pierre de Blarney, la tête en bas, donnerait le don de l'éloquence.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
