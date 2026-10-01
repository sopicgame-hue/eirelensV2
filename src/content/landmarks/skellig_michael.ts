/**
 * Skellig Michael (Kerry) — île-rocher à deux pics, monastère de cellules en
 * pierre sèche (clocháns) sur une terrasse, et quelques macareux.
 * Île exagérée par rapport au réel pour rester lisible dans l'Irlande miniature.
 * Accessible uniquement en currach.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const skelligMichael: LandmarkDef = {
  id: 'skellig_michael',
  name: 'Skellig Michael',
  county: 'Kerry',
  province: 'Munster',
  category: 'patrimoine',
  lat: 51.772,
  lon: -10.539,
  requires: 'boat',
  description: 'Une île-rocher abritant un monastère perché aux cellules de pierre en forme de ruche.',
  funFact: 'Des moines y ont vécu pendant des siècles, au sommet de plus de 600 marches taillées dans la roche.',
  status: 'done',
  photo: { focus: [0, 4, 0], radius: 18, minDistance: 22, maxDistance: 480, bestHours: [19, 21.5] },
  clearRadius: 30,
  terrain: [
    { kind: 'island', dx: -7, radius: 15, height: 17, blend: 10 },
    { kind: 'island', dx: 9, radius: 10, height: 13, blend: 8 },
    { kind: 'flatten', dx: 2, dz: 4, radius: 4, height: 10, blend: 3 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    // Clocháns (cellules en ruche) sur la terrasse
    const huts: [number, number][] = [
      [0, 3],
      [2.4, 2],
      [4.2, 3.6],
      [1, 5.6],
      [3.4, 6],
    ];
    for (const [x, z] of huts) {
      const y = ctx.groundAt(x, z);
      b.sphere(1.15, 'stone', { x, z, y: y + 0.2, sy: 1.25 }, 1);
      b.box(0.45, 0.7, 0.3, 'black', { x, z: z + 1.05, y });
    }
    // Petite croix de pierre
    b.box(0.25, 1.2, 0.15, 'stoneLight', { x: 2.5, z: 4.5, y: ctx.groundAt(2.5, 4.5) });
    b.box(0.7, 0.18, 0.15, 'stoneLight', { x: 2.5, z: 4.5, y: ctx.groundAt(2.5, 4.5) + 0.8 });
    // Escalier en zigzag (décor) du rivage sud jusqu'à la terrasse
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const x = 6 * Math.sin(t * 9) * (1 - t);
      const z = 13 - t * 9;
      b.box(1, 0.25, 0.6, 'stoneLight', { x, z, y: ctx.groundAt(x, z) + 0.05, ry: Math.sin(t * 9) });
    }
    // Macareux (puffins) sur les rochers
    for (let i = 0; i < 7; i++) {
      const a = 0.4 + i * 0.5;
      const x = Math.cos(a) * 12;
      const z = Math.sin(a) * 9;
      const y = ctx.groundAt(x, z);
      if (y < ctx.waterY + 0.3) continue;
      b.sphere(0.22, 'black', { x, z, y: y + 0.3, sy: 1.3 }, 0);
      b.sphere(0.15, 'white', { x, z: z + 0.1, y: y + 0.27, sy: 1.2 }, 0);
      b.cone(0.07, 0.18, 0xf2994a, { x, z: z + 0.22, y: y + 0.45, rx: Math.PI / 2 }, 4);
    }
    return b.mesh();
  },
};
