/**
 * Loughanleagh (Cavan) — sommet d'une colline (relief ajouté dans relief.ts)
 * couronné de trois cairns de l'âge de pierre, borne géodésique blanche et
 * panneau du Muff Heritage Trust. Ajoncs et aubépines couchées par le vent.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { cairn, viewpoint, smallTree } from '../../models/sceneryKit';

export const loughanleagh: LandmarkDef = {
  id: 'loughanleagh',
  name: 'Cairns de Loughanleagh',
  county: 'Cavan',
  province: 'Ulster',
  category: 'monument',
  tier: 'secondaire',
  lat: 53.908,
  lon: -6.903,
  rotationDeg: 180,
  description: 'Une colline du Cavan couronnée de trois cairns de l’âge de pierre, avec un large panorama sur les collines et les lacs alentour.',
  funFact: 'Ces trois cairns de l’âge de pierre se voient de loin sur la ligne de crête ; le site est mis en valeur par le Muff Heritage Trust, une association locale du comté de Cavan.',
  status: 'done',
  photo: { focus: [0, 1.6, 0], radius: 8, minDistance: 8, maxDistance: 160, bestHours: [19, 21] },
  clearRadius: 18,
  terrain: [{ kind: 'flatten', radius: 12, blend: 10 }],
  colliders: [
    { kind: 'circle', x: 0, z: 0, r: 3.2 },
    { kind: 'circle', x: -8, z: 4, r: 2.4 },
    { kind: 'circle', x: 7, z: 5, r: 2.2 },
    { kind: 'circle', x: 3, z: -6, r: 0.5 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    cairn(b, ctx, { radius: 3.4, height: 2.4 });
    cairn(b, ctx, { x: -8, z: 4, radius: 2.6, height: 1.7 });
    cairn(b, ctx, { x: 7, z: 5, radius: 2.4, height: 1.5 });
    // Borne géodésique (pilier blanc)
    b.box(0.7, 1.3, 0.7, 'whitewash', { x: 3, z: -6, y: ctx.groundAt(3, -6) });
    b.box(0.4, 0.1, 0.4, 'chrome', { x: 3, z: -6, y: ctx.groundAt(3, -6) + 1.3 });
    // Belvédère et panneau du Heritage Trust
    viewpoint(b, ctx, { z: -12, radius: 4, ry: Math.PI });
    for (let i = 0; i < 14; i++) {
      const x = -14 + ctx.rng() * 28;
      const z = -14 + ctx.rng() * 28;
      if (Math.hypot(x, z) < 5) continue;
      b.sphere(0.5 + ctx.rng() * 0.3, i % 2 ? 'gorse' : 'heather', { x, z, y: ctx.groundAt(x, z), sy: 0.6 }, 0);
    }
    smallTree(b, { x: 11, z: -4, y: ctx.groundAt(11, -4), s: 0.8 });
    return b.mesh();
  },
};
