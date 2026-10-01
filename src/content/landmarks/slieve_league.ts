/**
 * Falaises de Slieve League (Donegal) — belvédère de Bunglass au sommet des
 * falaises (relief réel du jeu), paroi stratifiée côté mer (+Z), panneau
 * "Sliabh Liag" et quelques moutons… concurrents de Paddy.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { cliffFace } from '../../models/landmarkKit';
import { viewpoint } from '../../models/sceneryKit';

export const slieveLeague: LandmarkDef = {
  id: 'slieve_league',
  name: 'Falaises de Slieve League',
  county: 'Donegal',
  province: 'Ulster',
  category: 'nature',
  tier: 'bonus',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 54.641,
  lon: -8.6654,
  rotationDeg: 290, // +Z vers l'océan
  description: 'Parmi les plus hautes falaises maritimes d’Europe : près de 600 m au-dessus de l’Atlantique.',
  funFact: 'Elles sont presque trois fois plus hautes que les Falaises de Moher.',
  status: 'done',
  photo: { focus: [0, -6, 22], radius: 18, minDistance: 12, maxDistance: 320, bestHours: [19, 21.5] },
  clearRadius: 16,
  terrain: [{ kind: 'flatten', radius: 5, blend: 4 }],
  colliders: [{ kind: 'circle', x: 2.5, z: 0.5, r: 0.6 }],

  build(ctx) {
    const b = new ModelBuilder();
    viewpoint(b, ctx, { radius: 5 });
    // Panneau "Sliabh Liag"
    b.box(0.15, 2.2, 0.15, 'woodDark', { x: 2.5, z: 0.5 });
    b.box(1.6, 0.6, 0.1, 'trainGreen', { x: 2.5, y: 1.6, z: 0.5 });
    // Moutons sauvages (petits blocs de laine)
    for (const [x, z] of [
      [-6, -3],
      [-7.5, -1.5],
      [7, -4],
    ]) {
      const y = ctx.groundAt(x, z);
      b.sphere(0.45, 'wool', { x, z, y: y + 0.5, sz: 1.3 }, 1);
      b.sphere(0.18, 'sheepFace', { x, z: z + 0.6, y: y + 0.6 }, 0);
    }
    // Paroi stratifiée sur le bord de la falaise
    cliffFace(b, ctx, { xFrom: -30, xTo: 30, step: 3, maxSearch: 50 });
    return b.mesh();
  },
};
