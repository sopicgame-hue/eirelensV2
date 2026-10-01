/**
 * Château de Glenveagh (Donegal) — château victorien crénelé (donjon carré +
 * tour ronde + ailes basses) au bord du Lough Veagh (lac décoratif côté +Z),
 * jardins, au cœur du parc national de Glenveagh et des monts Derryveagh.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { lake, smallTree } from '../../models/sceneryKit';

const LZ = 22;

export const glenveagh: LandmarkDef = {
  id: 'glenveagh',
  name: 'Château de Glenveagh',
  county: 'Donegal',
  province: 'Ulster',
  category: 'patrimoine',
  tier: 'principal',
  // Coordonnées approximatives du château (à vérifier sur Google Maps)
  lat: 55.0569,
  lon: -7.9395,
  rotationDeg: -45, // +Z vers le lac
  description: 'Un château victorien posé au bord du Lough Veagh, au cœur du plus grand parc national d’Irlande.',
  funFact: 'C’est à Glenveagh qu’on a réintroduit l’aigle royal en Irlande à partir de 2000, près d’un siècle après sa disparition.',
  status: 'done',
  photo: { focus: [0, 7, 0], radius: 10, minDistance: 12, maxDistance: 260, bestHours: [18, 20.5] },
  clearRadius: 20,
  clearAreas: [{ dx: 0, dz: LZ + 4, radius: 19 }],
  terrain: [
    { kind: 'flatten', radius: 14, blend: 8 },
    { kind: 'flatten', dz: LZ + 4, radius: 18, blend: 8, offset: -1 }, // lac un peu plus bas que le château
  ],
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 4, hd: 4, rot: 0 },
    { kind: 'circle', x: 5.5, z: 2.5, r: 2.4 },
    { kind: 'box', x: -6, z: -1, hw: 4, hd: 3, rot: 0 },
    { kind: 'box', x: 0, z: LZ + 4, hw: 17, hd: 9, rot: 0 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Donjon carré crénelé
    b.box(8, 13, 8, 'stoneLight');
    b.crenellations(8.3, 8.3, 'stoneLight', { y: 13 }, 0.6);
    for (const y of [3, 6.5, 10]) for (const s of [-1, 1]) b.box(0.9, 1.6, 0.12, 'window', { x: s * 2, y, z: 4.02 });
    // Tour ronde accolée
    b.cylinder(2.3, 2.4, 15, 'stoneLight', { x: 5.5, z: 2.5 }, 14);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.box(0.55, 0.65, 0.55, 'stoneLight', { x: 5.5 + Math.cos(a) * 2.2, z: 2.5 + Math.sin(a) * 2.2, y: 15 });
    }
    // Aile basse + toit d'ardoise, porche
    b.box(8, 6, 6, 'stone', { x: -6, z: -1 });
    b.crenellations(8.2, 6.2, 'stone', { x: -6, z: -1, y: 6 }, 0.5);
    b.box(2.4, 3, 1, 'stone', { x: -4, z: 2.4 });
    b.box(1.4, 2.4, 0.15, 'woodDark', { x: -4, z: 2.95 });
    // Jardins : pelouse, ifs taillés, massifs fleuris
    b.box(20, 0.06, 8, 'grassLight', { x: -2, z: 9, y: 0.01 });
    for (let i = 0; i < 6; i++) {
      b.cone(0.7, 2.4, 'leafDark', { x: -10 + i * 3.4, z: 6 }, 6);
      b.sphere(0.45, i % 2 ? 'facadeE' : 'facadeC', { x: -8.3 + i * 3.4, z: 11, y: 0.3 }, 0);
    }
    // Lac + forêt de pins sur l'autre rive
    const ly = ctx.groundAt(0, LZ + 4) + 0.1;
    lake(root, b, ctx, { x: 0, z: LZ + 4, rx: 16, rz: 8.5, y: ly });
    for (let i = 0; i < 10; i++) {
      const x = -18 + i * 4 + ctx.rng() * 2;
      const z = LZ + 14 + ctx.rng() * 4;
      smallTree(b, { x, z, y: ctx.groundAt(x, z), s: 1.1 + ctx.rng() * 0.5, kind: 'pine' });
    }
    root.add(b.mesh());
    return root;
  },
};
