/**
 * Newgrange (Meath) — grand tumulus au mur de quartz blanc ponctué de galets
 * de granite, entouré de pierres de bordure. L'entrée (+Z) regarde le sud-est,
 * vers le lever du soleil au solstice d'hiver.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const newgrange: LandmarkDef = {
  id: 'newgrange',
  name: 'Newgrange',
  county: 'Meath',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'principal',
  lat: 53.6947,
  lon: -6.4755,
  rotationDeg: 45,
  description: 'Un tumulus préhistorique couvert de quartz blanc, plus ancien que Stonehenge.',
  funFact: 'Au solstice d’hiver, le soleil levant illumine sa chambre funéraire pendant environ 17 minutes.',
  status: 'done',
  photo: { focus: [0, 3, 2], radius: 13, minDistance: 18, maxDistance: 320, bestHours: [7, 9] },
  clearRadius: 30,
  terrain: [{ kind: 'flatten', radius: 24, blend: 14 }],
  colliders: [{ kind: 'circle', x: 0, z: 0, r: 14.6 }],

  build(ctx) {
    const b = new ModelBuilder();
    const R = 14;
    // Mur de quartz (façade) + galets de granite
    b.cylinder(R, R, 3, 'quartz', { y: -0.2 }, 28);
    for (let i = 0; i < 70; i++) {
      const a = ctx.rng() * Math.PI * 2;
      b.box(0.35, 0.3, 0.1, 'stoneDark', { x: Math.sin(a) * (R + 0.02), z: Math.cos(a) * (R + 0.02), y: 0.3 + ctx.rng() * 2.2, ry: a });
    }
    // Dôme herbeux
    b.sphere(R, 'grass', { y: 2.7, sy: 0.32 }, 2);
    // Pierres de bordure (kerbstones)
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      b.box(1.8, 0.8, 0.5, 'stone', { x: Math.sin(a) * (R + 0.4), z: Math.cos(a) * (R + 0.4), y: -0.3, ry: a });
    }
    // Entrée + "roof-box" + pierre d'entrée gravée
    b.box(1.3, 1.9, 0.6, 'black', { z: R - 0.1 });
    b.box(1.5, 0.6, 0.6, 'stoneDark', { z: R - 0.05, y: 2.15 });
    b.box(1.1, 0.35, 0.5, 'black', { z: R + 0.05, y: 2.3 });
    b.box(3.2, 1.1, 0.7, 'stoneLight', { z: R + 1.6, y: -0.2 });
    // Cercle de pierres levées (partiel)
    for (let i = 0; i < 12; i++) {
      const a = -1.2 + (i / 11) * 2.4;
      const x = Math.sin(a) * 21;
      const z = Math.cos(a) * 21;
      b.box(0.9, 1.8 + ctx.rng(), 0.6, 'stone', { x, z, y: ctx.groundAt(x, z) - 0.3, ry: a + (ctx.rng() - 0.5) * 0.3 });
    }
    return b.mesh();
  },
};
