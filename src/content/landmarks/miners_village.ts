/**
 * Village des mineurs (Glendalough, Wicklow) — ruines de maisons de pierre et
 * terrils de déblais gris des anciennes mines de plomb, au bout du lac
 * supérieur de Glendalough (le lac est modélisé dans glendalough.ts).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { drystoneWall } from '../../models/landmarkKit';
import { smallTree } from '../../models/sceneryKit';

/** Maison en ruine : 4 murs de hauteurs inégales, sans toit, un pignon debout. */
function ruin(b: ModelBuilder, x: number, z: number, y: number, ry: number, rng: () => number) {
  b.push({ x, y, z, ry });
  const L = 5;
  const W = 3.6;
  b.box(L, 1.6 + rng() * 1.2, 0.5, 'stone', { z: -W / 2 });
  b.box(L, 0.8 + rng() * 1.6, 0.5, 'stoneDark', { z: W / 2 });
  b.box(0.5, 2.6, W, 'stone', { x: -L / 2 });
  b.roof(0.5, 1.4, W, 'stone', { x: -L / 2, y: 2.6 });
  b.box(0.5, 1 + rng(), W * 0.6, 'stoneDark', { x: L / 2, z: -W * 0.2 });
  b.box(0.8, 0.9, 0.55, 'black', { x: -1, y: 0.8, z: -W / 2 }); // fenêtre vide
  b.pop();
}

export const minersVillage: LandmarkDef = {
  id: 'miners_village',
  name: 'Village des mineurs de Glendalough',
  county: 'Wicklow',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Coordonnées approximatives (au bout ouest du lac supérieur, à vérifier)
  lat: 53.0105,
  lon: -6.389,
  rotationDeg: 90, // +Z vers le lac (à l'est)
  description: 'Les ruines du village des mineurs, au bout du lac supérieur de Glendalough, là où l’on extrayait le plomb.',
  funFact: 'Les mines de plomb de la vallée ont fonctionné du début du XIXe siècle jusqu’au milieu du XXe ; leurs terrils gris sont toujours là.',
  status: 'done',
  photo: { focus: [0, 2, 0], radius: 9, minDistance: 8, maxDistance: 180, bestHours: [8, 10] },
  clearRadius: 20,
  terrain: [{ kind: 'flatten', radius: 14, blend: 10 }],
  colliders: [
    { kind: 'box', x: -5, z: 0, hw: 2.8, hd: 2.2, rot: 0.2 },
    { kind: 'box', x: 4, z: -3, hw: 2.8, hd: 2.2, rot: -0.3 },
    { kind: 'box', x: 1, z: 5, hw: 2.8, hd: 2.2, rot: 0.1 },
    { kind: 'circle', x: -10, z: -9, r: 5 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    ruin(b, -5, 0, 0, 0.2, ctx.rng);
    ruin(b, 4, -3, ctx.groundAt(4, -3), -0.3, ctx.rng);
    ruin(b, 1, 5, ctx.groundAt(1, 5), 0.1, ctx.rng);
    // Terrils de déblais (cônes de gravats gris clair)
    for (const [x, z, r, h] of [
      [-10, -9, 5, 4],
      [-14, -2, 3.5, 2.6],
      [-4, -12, 3, 2],
    ]) {
      b.cone(r, h, 'stoneLight', { x, z, y: ctx.groundAt(x, z) - 0.2 }, 9);
      for (let i = 0; i < 6; i++) b.sphere(0.3 + ctx.rng() * 0.3, 'rock', { x: x + (ctx.rng() - 0.5) * r * 1.6, z: z + (ctx.rng() - 0.5) * r * 1.6, y: ctx.groundAt(x, z) }, 0);
    }
    // Rails de wagonnets rouillés et bouleaux
    for (let i = 0; i < 8; i++) b.box(0.3, 0.12, 1.6, 'woodDark', { x: 8 + i * 1.1, z: 2, y: ctx.groundAt(8 + i * 1.1, 2) });
    for (const s of [-1, 1]) b.box(9, 0.12, 0.1, 'peat', { x: 11.8, z: 2 + s * 0.55, y: ctx.groundAt(11.8, 2) + 0.12 });
    for (let i = 0; i < 5; i++) {
      const x = 6 + ctx.rng() * 10;
      const z = -10 + ctx.rng() * 6;
      smallTree(b, { x, z, y: ctx.groundAt(x, z), s: 0.8 + ctx.rng() * 0.3 });
    }
    drystoneWall(b, ctx, -8, 9, 6, 11);
    return b.mesh();
  },
};
