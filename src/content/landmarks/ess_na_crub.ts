/**
 * Cascade d'Ess-na-Crub (Glenariff, Antrim) — chute large et basse, dans le
 * vallon boisé de Glenariff, avec une passerelle en bois du sentier des cascades.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { waterfall, animateScenery } from '../../models/sceneryKit';

const H = 6;
const W = 7;

export const essNaCrub: LandmarkDef = {
  id: 'ess_na_crub',
  name: 'Cascade d’Ess-na-Crub',
  county: 'Antrim',
  province: 'Ulster',
  category: 'nature',
  tier: 'bonus',
  lat: 55.0223,
  lon: -6.1251,
  rotationDeg: 140,
  description: 'Une large cascade cachée dans les bois de Glenariff, surnommée la « reine des Glens » d’Antrim.',
  funFact: 'Le sentier des cascades de Glenariff serpente sur des passerelles en bois accrochées aux parois depuis l’époque victorienne.',
  status: 'done',
  photo: { focus: [0, H / 2, -0.5], radius: W / 2 + 1, minDistance: 6, maxDistance: 100, bestHours: [9, 12] },
  clearRadius: 18,
  terrain: [{ kind: 'flatten', radius: 14, blend: 10 }],
  colliders: [
    { kind: 'box', x: 0, z: -4, hw: (W + 10) / 2, hd: 4, rot: 0 },
    { kind: 'circle', x: 0, z: 5.5, r: W * 0.8 + 2.3 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    waterfall(root, b, ctx, { height: H, width: W, steps: 2, foam: 46 });
    // Passerelle en bois qui enjambe le ruisseau en aval
    b.box(8, 0.2, 1.6, 'wood', { y: 0.9, z: 17 });
    for (const x of [-3.5, 0, 3.5]) for (const s of [-1, 1]) b.box(0.12, 1.9, 0.12, 'woodDark', { x, z: 17 + s * 0.75 });
    for (const s of [-1, 1]) b.box(8, 0.1, 0.1, 'woodDark', { y: 1.9, z: 17 + s * 0.75 });
    root.add(b.mesh());
    return root;
  },
  animate: animateScenery,
};
