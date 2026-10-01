/**
 * Connemara — LE paysage de l'Ouest : belvédère au bord de Derryclare Lough,
 * l'îlot aux pins au milieu du lac, la chaîne des Twelve Bens derrière (relief
 * réel du jeu, côté +Z), tourbière, meules de tourbe et chaumière.
 * Sujet de la photo : l'îlot boisé avec les montagnes en fond.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { cottage, drystoneWall } from '../../models/landmarkKit';
import { lake, viewpoint, smallTree } from '../../models/sceneryKit';

const LZ = 24; // centre du lac (devant le belvédère)

export const connemara: LandmarkDef = {
  id: 'connemara',
  name: 'Connemara et les Twelve Bens',
  county: 'Galway',
  province: 'Connacht',
  category: 'nature',
  tier: 'principal',
  // Point de vue approximatif au sud de Derryclare Lough (à vérifier sur Google Maps)
  lat: 53.465,
  lon: -9.775,
  rotationDeg: -149, // +Z vers les Twelve Bens
  description: 'Lacs, tourbières et la chaîne des Twelve Bens : le Connemara est le paysage le plus sauvage de l’ouest irlandais.',
  funFact: 'Le petit îlot planté de pins au milieu de Derryclare Lough, devant les montagnes, est l’une des vues les plus photographiées d’Irlande.',
  status: 'done',
  photo: { focus: [0, 3, LZ], radius: 8, minDistance: 10, maxDistance: 260, bestHours: [6.5, 9] },
  clearRadius: 14,
  clearAreas: [{ dx: 0, dz: LZ, radius: 22 }],
  // Le lac décoratif a besoin d'un sol plat, un peu plus bas que la rive
  terrain: [
    { kind: 'flatten', radius: 6, blend: 4 },
    { kind: 'flatten', dz: LZ, radius: 20, blend: 8, offset: -1.2 }, // lac 1,2 u sous le belvédère
  ],
  colliders: [
    { kind: 'circle', x: -14, z: -6, r: 4 },
    { kind: 'box', x: 0, z: LZ, hw: 18, hd: 10, rot: 0 }, // on ne marche pas sur l'eau du lac
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Belvédère face au lac
    viewpoint(b, ctx, { z: 2, radius: 5 });
    // Lac + îlot aux pins
    const ly = ctx.groundAt(0, LZ) + 0.1;
    lake(root, b, ctx, { x: 0, z: LZ, rx: 19, rz: 11, y: ly });
    b.sphere(3, 'grassDark', { x: 3, z: LZ + 2, y: ly - 1.4, sy: 0.5 }, 1);
    for (const [x, z, s] of [
      [2.2, LZ + 1.5, 1.3],
      [3.6, LZ + 2.6, 1.0],
      [4.0, LZ + 1.0, 0.8],
    ])
      smallTree(b, { x, z, y: ly, s, kind: 'pine' });
    // Tourbière : meules de tourbe, mottes de bruyère
    for (let i = 0; i < 5; i++) {
      const x = 10 + (i % 3) * 2.2;
      const z = -4 - Math.floor(i / 3) * 2.4;
      const y = ctx.groundAt(x, z);
      for (let k = 0; k < 3; k++) b.box(0.6, 0.3, 0.3, 'peat', { x, z: z + (k - 1) * 0.12, y: y + k * 0.28, ry: k * 0.9 });
    }
    for (let i = 0; i < 18; i++) {
      const x = -20 + ctx.rng() * 40;
      const z = -12 + ctx.rng() * 8;
      b.sphere(0.5 + ctx.rng() * 0.4, i % 3 ? 'heather' : 'gorse', { x, z, y: ctx.groundAt(x, z), sy: 0.6 }, 0);
    }
    // Chaumière blanchie et son muret
    cottage(b, { x: -14, z: -6, y: ctx.groundAt(-14, -6), ry: 0.4 });
    drystoneWall(b, ctx, -22, -1, -6, -1);
    root.add(b.mesh());
    return root;
  },
};
