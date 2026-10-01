/**
 * Phare du Baily (Howth Head, Dublin) — à la pointe est de la presqu'île de
 * Howth : tour blanche et lanterne noire, maisons des gardiens, muret, et la
 * mer de deux côtés (côté +Z). Le "point le plus à l'est" de la baie de Dublin.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { lighthouse, cliffFace, drystoneWall } from '../../models/landmarkKit';

export const howthBaily: LandmarkDef = {
  id: 'howth_baily',
  name: 'Phare du Baily (Howth)',
  county: 'Dublin',
  province: 'Leinster',
  category: 'phare',
  tier: 'principal',
  // Pointe est de Howth Head ; légèrement ajusté pour tomber sur la côte du jeu
  lat: 53.369,
  lon: -6.064,
  rotationDeg: 45, // +Z vers la mer (sud-est)
  description: 'Le phare du Baily, à la pointe est de la presqu’île de Howth, veille sur l’entrée de la baie de Dublin.',
  funFact: 'Ce fut le dernier phare d’Irlande à être automatisé, en 1997 : jusque-là, des gardiens y vivaient à demeure.',
  status: 'done',
  photo: { focus: [0, 7, 0], radius: 8, minDistance: 8, maxDistance: 260, bestHours: [6, 8] },
  clearRadius: 14,
  // Pas de 'flatten' : la mer est à 2 u (elle serait comblée)
  colliders: [
    { kind: 'circle', x: 0, z: 0, r: 2.3 },
    { kind: 'box', x: -5.5, z: -3, hw: 3.6, hd: 1.8, rot: 0 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Socle + phare (brique du kit, lanterne lumineuse)
    b.cylinder(2.4, 2.6, 0.8, 'whitewash', { y: -0.4 }, 14);
    lighthouse(b, { height: 9, radius: 1.9, color: 'whitewash' }, root);
    // Maisons des gardiens, blanchies, toits d'ardoise, cheminées
    b.box(7, 3, 3.4, 'whitewash', { x: -5.5, z: -3 });
    b.roof(7.4, 1.6, 3.9, 'slate', { x: -5.5, z: -3, y: 3 });
    for (const x of [-8, -3]) b.box(0.6, 1.4, 0.6, 'whitewash', { x, z: -3, y: 4 });
    for (const x of [-7.5, -5.5, -3.5]) b.box(0.8, 1, 0.1, 'window', { x, y: 1.4, z: -1.28 });
    b.box(0.9, 1.9, 0.1, 'door', { x: -5.5, z: -1.28 });
    // Muret d'enceinte blanc + rochers de la pointe
    drystoneWall(b, ctx, -10, -6, 4, -6, 'whitewash');
    drystoneWall(b, ctx, -10, -6, -10, 2, 'whitewash');
    cliffFace(b, ctx, { xFrom: -12, xTo: 12, step: 3, maxSearch: 16, colors: ['rockDark', 'rock', 'stoneDark'] });
    root.add(b.mesh());
    return root;
  },
};
