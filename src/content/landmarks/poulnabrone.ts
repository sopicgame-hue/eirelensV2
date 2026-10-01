/**
 * Dolmen de Poulnabrone (Clare, Burren) — tombe à portique sur pavement calcaire.
 * Le premier monument proche du point de départ : il doit être lisible de loin.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const poulnabrone: LandmarkDef = {
  id: 'poulnabrone',
  name: 'Dolmen de Poulnabrone',
  county: 'Clare',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  lat: 53.0487,
  lon: -9.14,
  rotationDeg: 200,
  description: 'Une tombe mégalithique posée sur le pavement calcaire du Burren.',
  funFact: 'Il a été érigé il y a plus de 5 000 ans, bien avant les pyramides d’Égypte.',
  status: 'done',
  photo: { focus: [0, 1.8, 0], radius: 3, minDistance: 3, maxDistance: 90, bestHours: [6.5, 8.5] },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 8, blend: 8 }],
  colliders: [{ kind: 'box', x: 0, z: 0, hw: 1.4, hd: 1.6, rot: 0 }],

  build(ctx) {
    const b = new ModelBuilder();
    // Pavement calcaire fissuré (dalles séparées par des "grikes")
    for (let x = -7; x <= 7; x += 1.7)
      for (let z = -7; z <= 7; z += 1.3) {
        if (Math.hypot(x, z) > 7.5 || ctx.rng() < 0.15) continue;
        b.box(1.5 + ctx.rng() * 0.1, 0.25, 1.1, ctx.rng() < 0.3 ? 'stoneLight' : 'limestone', { x, z, y: ctx.groundAt(x, z) - 0.12, ry: (ctx.rng() - 0.5) * 0.1 });
      }
    // Pierres dressées : icosaèdres étirés = blocs irréguliers (plus naturel que des boîtes)
    const slab = (x: number, z: number, w: number, h: number, d: number, color: 'stone' | 'stoneDark', rz = 0, ry = 0) =>
      b.sphere(1, color, { x, z, y: h / 2 - 0.15, sx: w / 2, sy: h / 2, sz: d / 2, rz, ry }, 0);
    // Portique (avant, +Z) : deux hautes pierres fines
    slab(-1.0, 1.0, 0.45, 2.6, 1.5, 'stone', 0.05);
    slab(1.0, 1.0, 0.45, 2.6, 1.5, 'stone', -0.05);
    // Côtés et fond, un peu plus bas
    slab(-1.05, -0.7, 0.4, 2.1, 1.6, 'stoneDark');
    slab(1.05, -0.7, 0.4, 2.1, 1.6, 'stoneDark');
    slab(0, -1.35, 1.7, 1.8, 0.4, 'stoneDark');
    // Table (capstone) : grande dalle plate inclinée, plus haute à l'avant
    b.sphere(1, 'stoneLight', { y: 2.25, z: 0.1, sx: 2.1, sy: 0.24, sz: 1.55, rx: -0.17, rz: 0.05, ry: 0.15 }, 0);
    return b.mesh();
  },
};
