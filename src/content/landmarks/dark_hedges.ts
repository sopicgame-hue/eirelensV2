/**
 * Les Dark Hedges (Antrim) — allée de hêtres dont les branches se rejoignent
 * au-dessus d'un chemin. Le chemin et les arbres font partie du monument.
 * Repère local : l'allée suit l'axe Z (de -32 à +32).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const BARK = 0x7d776c;

export const darkHedges: LandmarkDef = {
  id: 'dark_hedges',
  name: 'Les Dark Hedges',
  county: 'Antrim',
  province: 'Ulster',
  category: 'nature',
  tier: 'secondaire',
  lat: 55.1346,
  lon: -6.3806,
  rotationDeg: 75,
  description: 'Une allée de hêtres centenaires aux branches entrelacées.',
  funFact: 'Les hêtres ont été plantés au XVIIIe siècle par la famille Stuart pour impressionner les visiteurs de leur manoir.',
  status: 'done',
  photo: { focus: [0, 4, 0], radius: 10, minDistance: 6, maxDistance: 150, bestHours: [6.5, 9] },
  clearRadius: 40,
  terrain: [
    { kind: 'flatten', dz: -18, radius: 18, blend: 12 },
    { kind: 'flatten', dz: 18, radius: 18, blend: 12 },
  ],
  colliders: [],

  build(ctx) {
    const b = new ModelBuilder();
    // Chemin de terre qui suit le sol
    for (let z = -34; z <= 34; z += 2) {
      b.box(3.2, 0.12, 2.1, 'peat', { z, y: ctx.groundAt(0, z) + 0.02 });
    }
    // Deux rangées de hêtres penchés vers le chemin
    for (let z = -30; z <= 30; z += 6) {
      for (const side of [-1, 1]) {
        const x0 = side * 3.4 + (ctx.rng() - 0.5) * 0.6;
        const zz = z + (ctx.rng() - 0.5) * 1.5;
        const y0 = ctx.groundAt(x0, zz) - 0.2;
        // Tronc en 3 segments qui se courbent vers le centre
        b.cylinder(0.32, 0.42, 2.4, BARK, { x: x0, z: zz, y: y0, rz: side * 0.12 }, 7);
        b.cylinder(0.24, 0.32, 2.4, BARK, { x: x0 - side * 0.3, z: zz, y: y0 + 2.3, rz: side * 0.55 }, 6);
        b.cylinder(0.14, 0.24, 2.6, BARK, { x: x0 - side * 1.5, z: zz, y: y0 + 4.2, rz: side * 1.05 }, 5);
        b.cylinder(0.12, 0.18, 2, BARK, { x: x0 + side * 0.4, z: zz + 0.5, y: y0 + 3.2, rz: -side * 0.5, rx: 0.3 }, 5);
        // Feuillage sombre
        b.sphere(1.6, 'leafDark', { x: x0 - side * 2.6, z: zz, y: y0 + 6.4, sy: 0.6 }, 0);
        b.sphere(1.3, 'leaf', { x: x0 - side * 0.6, z: zz + 0.8, y: y0 + 5.8, sy: 0.7 }, 0);
        b.sphere(1.1, 'leafDark', { x: x0 + side * 0.8, z: zz - 0.6, y: y0 + 5.0, sy: 0.7 }, 0);
        // Racines
        for (let k = 0; k < 3; k++) {
          const a = ctx.rng() * Math.PI * 2;
          b.box(0.25, 0.25, 1.4, BARK, { x: x0 + Math.cos(a) * 0.6, z: zz + Math.sin(a) * 0.6, y: y0 + 0.1, ry: a, rx: 0.2 });
        }
      }
    }
    return b.mesh();
  },
};
