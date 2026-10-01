/**
 * Glendalough (Wicklow) — monastère de saint Kevin dans une vallée glaciaire :
 * tour ronde, église au toit de pierre ("St Kevin's Kitchen"), cathédrale en
 * ruine, croix celtique, porche d'entrée… et le lac supérieur, à l'ouest (−X),
 * qui mène au village des mineurs (miners_village.ts).
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { roundTower, celticCross, ruinedChurch } from '../../models/landmarkKit';
import { lake, smallTree } from '../../models/sceneryKit';

/** Lac supérieur : centre (local) et demi-axes. */
const LAKE = { x: -33, z: 3, rx: 14, rz: 6 };

export const glendalough: LandmarkDef = {
  id: 'glendalough',
  name: 'Glendalough',
  county: 'Wicklow',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'principal',
  lat: 53.0105,
  lon: -6.3271,
  description: 'Un monastère fondé par saint Kevin au VIe siècle, au creux d’une vallée glaciaire.',
  funFact: 'Sa tour ronde mesure environ 30 m : elle servait à la fois de clocher et de refuge.',
  status: 'done',
  photo: { focus: [0, 8, 0], radius: 9, minDistance: 10, maxDistance: 300, bestHours: [7, 9] },
  clearRadius: 24,
  clearAreas: [{ dx: LAKE.x, dz: LAKE.z, radius: 17 }],
  terrain: [
    { kind: 'flatten', radius: 18, blend: 14 },
    { kind: 'flatten', dx: LAKE.x, dz: LAKE.z, radius: 16, blend: 8 },
  ],
  colliders: [
    { kind: 'box', x: LAKE.x, z: LAKE.z, hw: LAKE.rx - 1, hd: LAKE.rz - 1, rot: 0 }, // on ne marche pas sur le lac
    { kind: 'circle', x: 0, z: 0, r: 1.5 },
    { kind: 'box', x: 8, z: 4, hw: 2.6, hd: 2.1, rot: 0 },
    { kind: 'box', x: -8, z: 6, hw: 5.2, hd: 2.3, rot: 0 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Tour ronde (brique du kit)
    roundTower(b, { height: 16, radius: 1.3 });

    // St Kevin's Kitchen : église au toit de pierre + petit clocher rond
    b.box(5, 3.6, 4, 'stone', { x: 8, z: 4 });
    b.roof(5.2, 3.6, 4.3, 'stoneDark', { x: 8, z: 4, y: 3.6 });
    b.cylinder(0.55, 0.6, 2.4, 'stone', { x: 10, z: 4, y: 5.2 }, 8);
    b.cone(0.65, 1, 'stoneDark', { x: 10, z: 4, y: 7.6 }, 8);
    b.box(0.9, 1.7, 0.2, 'woodDark', { x: 6.2, z: 6.05 });

    // Cathédrale en ruine + croix celtique (briques du kit)
    ruinedChurch(b, { x: -8, z: 6, length: 10, width: 4.6, height: 4.5 });
    celticCross(b, { x: 4, z: -5, height: 3.2 });

    // Pierres tombales
    for (let i = 0; i < 9; i++) b.box(0.6, 0.9 + (i % 3) * 0.2, 0.15, 'stoneDark', { x: -6 + (i % 3) * 1.6, z: -4 - Math.floor(i / 3) * 1.6, rz: (i % 2 ? 1 : -1) * 0.06 });

    // Porche d'entrée du monastère
    b.arch(5, 4.5, 1.4, 2.2, 3.2, 'stone', { z: -13 });

    // Lac supérieur entouré de pins (la vallée glaciaire)
    lake(root, b, ctx, { ...LAKE, y: ctx.groundAt(LAKE.x, LAKE.z) + 0.1 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = LAKE.x + Math.cos(a) * (LAKE.rx + 3 + ctx.rng() * 2);
      const z = LAKE.z + Math.sin(a) * (LAKE.rz + 3 + ctx.rng() * 2);
      smallTree(b, { x, z, y: ctx.groundAt(x, z), s: 1 + ctx.rng() * 0.5, kind: 'pine' });
    }
    root.add(b.mesh());
    return root;
  },
};
