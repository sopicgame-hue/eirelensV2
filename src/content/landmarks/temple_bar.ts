/**
 * Temple Bar (Dublin) — STATUT : PROVISOIRE (cairn).
 * À FAIRE : remplacer par un vrai modèle. Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md
 * et s'inspirer de cliffs_of_moher.ts / rock_of_cashel.ts.
 */
import { LandmarkDef } from './types';

export const templeBar: LandmarkDef = {
  id: 'temple_bar',
  name: "Temple Bar",
  county: 'Dublin',
  province: 'Leinster',
  category: 'ville',
  lat: 53.3455,
  lon: -6.2643,
  description: "Le quartier animé de Dublin, ses pubs colorés et sa musique live.",
  funFact: "Le pub rouge le plus photographié du quartier s'appelle… The Temple Bar.",
  status: 'placeholder',
  photo: { focus: [0, 2, 0], radius: 4, minDistance: 4, maxDistance: 120 },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 6 }],
};
