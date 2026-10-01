/**
 * Fungie, le dauphin de Dingle (Kerry) — statue de bronze sur le port, et un
 * dauphin bien vivant qui saute dans la baie (clin d'œil : on peut le
 * photographier avec la statue). Le port (eau) est du côté +Z (rotationDeg).
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { sharedMaterials } from '../../models/materials';
import { dolphin, animateScenery, rowingBoat } from '../../models/sceneryKit';

export const fungieDingle: LandmarkDef = {
  id: 'fungie_dingle',
  name: 'Fungie, le dauphin de Dingle',
  county: 'Kerry',
  province: 'Munster',
  category: 'monument',
  tier: 'principal',
  lat: 52.1393,
  lon: -10.2734,
  rotationDeg: 345, // +Z vers le port
  description: 'La statue de Fungie, le dauphin sauvage qui a accompagné les bateaux de la baie de Dingle pendant près de quarante ans.',
  funFact: 'Fungie est arrivé dans la baie en 1983 et n’en est reparti qu’en 2020 : un record pour un dauphin solitaire. Regarde bien la baie… un de ses cousins y saute parfois !',
  status: 'done',
  photo: { focus: [0, 2.6, 0], radius: 3.2, minDistance: 4, maxDistance: 90, bestHours: [7, 9] },
  clearRadius: 22, // dégage les maisons du port autour de la statue
  terrain: [{ kind: 'flatten', radius: 4, blend: 3 }], // petit : le port est à 9 u
  colliders: [{ kind: 'circle', x: 0, z: 0, r: 1.7 }],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Quai en pierre jusqu'au bord de l'eau, bollards et casiers à homards
    b.box(16, 0.3, 9, 'stoneLight', { z: 3.5, y: -0.25 });
    b.box(16, 0.35, 0.5, 'stone', { z: 8, y: -0.2 });
    for (const x of [-6, -2, 2, 6]) b.cylinder(0.25, 0.3, 0.7, 'black', { x, z: 7.4 }, 8);
    for (let i = 0; i < 4; i++) b.box(0.9, 0.6, 0.6, i % 2 ? 'wood' : 'woodDark', { x: -6.5 + (i % 2) * 1, y: Math.floor(i / 2) * 0.6, z: 2 });
    // Socle rocheux de la statue
    b.cylinder(1.5, 1.7, 0.5, 'stone', {}, 10);
    b.sphere(1.25, 'rockDark', { y: 0.7, sy: 0.75 }, 0);
    b.sphere(0.8, 'rock', { x: 0.5, y: 1.2, z: 0.3, sy: 0.7 }, 0);
    // Plaque
    b.box(0.9, 0.5, 0.08, 'gold', { y: 0.35, z: 1.62, rx: -0.3 });
    // Barque amarrée (dans l'eau, devant le quai)
    rowingBoat(b, { x: 4, z: 10.5, y: ctx.waterY - 0.2, ry: Math.PI / 2, color: 'facadeA' });
    root.add(b.mesh());

    // Statue de bronze : dauphin en plein saut (matériau partagé "bronze")
    const s = new ModelBuilder();
    s.push({ y: 2.6, rx: -0.55 });
    s.sphere(0.5, 'white', { sx: 0.8, sy: 0.75, sz: 2.4 }, 1);
    s.cone(0.17, 0.55, 'white', { y: 0.12, z: 1.2, rx: Math.PI / 2 }, 6);
    s.cone(0.32, 0.65, 'white', { y: 0.28, z: -0.1, rx: -0.5, sz: 0.25 }, 4);
    s.box(1.25, 0.08, 0.42, 'white', { z: -1.35 });
    s.pop();
    s.cylinder(0.12, 0.16, 1.6, 'white', { y: 1.1, z: -0.2 }, 6); // tige de fixation
    const statue = new THREE.Mesh(s.build(), sharedMaterials().bronze);
    statue.castShadow = true;
    root.add(statue);

    // Un dauphin vivant saute au large, parallèlement au quai
    dolphin(root, ctx, { x: -2, z: 22, dirX: 1, dirZ: 0 });
    return root;
  },
  animate: animateScenery,
};
