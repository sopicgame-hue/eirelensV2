/**
 * Château de Ross (Kerry) — tour-maison du XVe siècle au bord du Lough Leane,
 * entourée de son enceinte (bawn) à tourelles rondes. Le lac est côté +Z,
 * avec un petit embarcadère et des barques (on y loue encore des bateaux).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { towerHouse } from '../../models/landmarkKit';
import { rowingBoat } from '../../models/sceneryKit';

export const rossCastle: LandmarkDef = {
  id: 'ross_castle',
  name: 'Château de Ross',
  county: 'Kerry',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 52.0444,
  lon: -9.5168,
  rotationDeg: 265, // +Z vers le Lough Leane
  description: 'Une tour-maison du XVe siècle au bord du Lough Leane, à Killarney.',
  funFact: 'Une prophétie disait qu’il ne tomberait que face à un navire : en 1652, les assaillants en ont fait venir un sur le lac… et la garnison s’est rendue.',
  status: 'done',
  photo: { focus: [0, 8, 0], radius: 9, minDistance: 10, maxDistance: 220, bestHours: [18.5, 20.5] },
  clearRadius: 16,
  terrain: [{ kind: 'flatten', radius: 3, blend: 2 }], // petit : le lac est à 5 u
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 4.2, hd: 3.6, rot: 0 },
    { kind: 'box', x: 0, z: -7, hw: 8, hd: 0.6, rot: 0 },
    { kind: 'box', x: -7.5, z: -2, hw: 0.6, hd: 5, rot: 0 },
    { kind: 'box', x: 7.5, z: -2, hw: 0.6, hd: 5, rot: 0 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    // Tour-maison (brique du kit) — 5 niveaux, toit d'ardoise visible derrière les créneaux
    towerHouse(b, { width: 8, depth: 7, height: 16, color: 'stone' });
    b.roof(6.5, 2.5, 5.5, 'slate', { y: 16 });
    b.box(1, 1.8, 1, 'stone', { x: 2.5, y: 16.5 }); // cheminée
    // Enceinte (bawn) en U ouverte vers le lac, tourelles rondes aux angles
    b.box(15, 3.2, 1, 'stoneDark', { z: -7 });
    for (const s of [-1, 1]) {
      b.box(1, 3.2, 10, 'stoneDark', { x: s * 7.5, z: -2 });
      b.cylinder(1.3, 1.4, 4.5, 'stone', { x: s * 7.5, z: -7 }, 10);
      b.cone(1.5, 1.6, 'slate', { x: s * 7.5, z: -7, y: 4.5 }, 10);
    }
    // Embarcadère vers le lac + barques
    b.box(2, 0.25, 9, 'wood', { x: 3, z: 9, y: 0.1 });
    for (const z of [6, 9, 12]) for (const s of [-1, 1]) b.cylinder(0.12, 0.12, 2, 'woodDark', { x: 3 + s * 0.9, z, y: ctx.waterY - 1 }, 5);
    rowingBoat(b, { x: 5.3, z: 10, y: ctx.waterY - 0.25, color: 'facadeD' });
    rowingBoat(b, { x: 0.7, z: 11.5, y: ctx.waterY - 0.25, ry: 0.3, color: 'facadeB' });
    return b.mesh();
  },
};
