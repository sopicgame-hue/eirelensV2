/**
 * Lough Conn Drive (Mayo) — belvédère sur la route panoramique, au-dessus du
 * lac (réel dans le jeu), face au mont Nephin (relief réel, côté +Z).
 * Sujet de la photo : le lac avec le Nephin en fond.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { viewpoint, rowingBoat, smallTree } from '../../models/sceneryKit';

export const loughConn: LandmarkDef = {
  id: 'lough_conn',
  name: 'Lough Conn Drive',
  county: 'Mayo',
  province: 'Connacht',
  category: 'nature',
  tier: 'secondaire',
  // Belvédère approximatif sur la rive est (à vérifier sur Google Maps)
  lat: 54.035,
  lon: -9.213,
  rotationDeg: 285, // +Z vers le lac et le Nephin
  description: 'La route panoramique qui fait le tour du Lough Conn, dominée par la silhouette solitaire du mont Nephin.',
  funFact: 'Le Lough Conn est réputé pour la pêche à la truite et au saumon ; à Pontoon, un pont le sépare du Lough Cullen voisin.',
  status: 'done',
  photo: { focus: [0, 8, 45], radius: 22, minDistance: 15, maxDistance: 420, bestHours: [19, 21.5] },
  clearRadius: 12,
  terrain: [{ kind: 'flatten', radius: 4, blend: 3 }], // petit : le lac est à 9 u
  colliders: [{ kind: 'circle', x: 0, z: -2, r: 1 }],

  build(ctx) {
    const b = new ModelBuilder();
    viewpoint(b, ctx, { radius: 4.5 });
    // Panneau "Lough Conn Drive" (poteau + flèche)
    b.box(0.15, 2.4, 0.15, 'woodDark', { z: -2 });
    b.box(1.8, 0.4, 0.08, 'trainGreen', { x: 0.7, y: 2.0, z: -2 });
    b.box(1.8, 0.4, 0.08, 'trainGreen', { x: -0.7, y: 1.5, z: -2 });
    // Ajoncs, aubépines penchées par le vent, barque de pêcheur sur la rive
    for (let i = 0; i < 10; i++) {
      const x = -9 + ctx.rng() * 18;
      const z = -6 + ctx.rng() * 4;
      b.sphere(0.6, i % 2 ? 'gorse' : 'leafDark', { x, z, y: ctx.groundAt(x, z), sy: 0.7 }, 0);
    }
    smallTree(b, { x: 6, z: -1, y: ctx.groundAt(6, -1), s: 0.9 });
    rowingBoat(b, { x: -3, z: 9, y: Math.max(ctx.waterY - 0.2, ctx.groundAt(-3, 9)), ry: 1.2, color: 'facadeD' });
    return b.mesh();
  },
};
