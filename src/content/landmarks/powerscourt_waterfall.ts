/**
 * Cascade de Powerscourt (Wicklow) — la plus haute d'Irlande : longue chute
 * en plusieurs ressauts au fond d'un vallon boisé.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { waterfall, animateScenery } from '../../models/sceneryKit';

const H = 18;
const W = 3.2;

export const powerscourtWaterfall: LandmarkDef = {
  id: 'powerscourt_waterfall',
  name: 'Cascade de Powerscourt',
  county: 'Wicklow',
  province: 'Leinster',
  category: 'nature',
  tier: 'bonus',
  // Coordonnées approximatives (à vérifier sur Google Maps)
  lat: 53.1435,
  lon: -6.203,
  rotationDeg: 20,
  description: 'Avec 121 mètres, c’est la plus haute cascade d’Irlande, au fond d’un vallon boisé du domaine de Powerscourt.',
  funFact: 'Pour la visite du roi George IV en 1821, on retint l’eau en amont pour offrir un lâcher spectaculaire… mais le roi ne vint jamais voir la cascade.',
  status: 'done',
  photo: { focus: [0, H / 2, -1], radius: H / 2 + 1, minDistance: 8, maxDistance: 160, bestHours: [10, 13] },
  clearRadius: 20,
  terrain: [{ kind: 'flatten', radius: 15, blend: 10 }],
  colliders: [
    { kind: 'box', x: 0, z: -5, hw: (W + 10) / 2, hd: 5, rot: 0 },
    { kind: 'circle', x: 0, z: 4, r: W * 0.8 + 2.3 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    waterfall(root, b, ctx, { height: H, width: W, steps: 5, foam: 50 });
    // Bancs de pique-nique dans la prairie
    for (const x of [-10, 10]) {
      b.box(2.2, 0.12, 0.9, 'wood', { x, y: 0.8, z: 12 });
      for (const s of [-1, 1]) b.box(2.2, 0.1, 0.35, 'wood', { x, y: 0.45, z: 12 + s * 0.9 });
      for (const s of [-1, 1]) b.box(0.15, 0.8, 1.8, 'woodDark', { x: x + s * 0.9, z: 12 });
    }
    root.add(b.mesh());
    return root;
  },
  animate: animateScenery,
};
