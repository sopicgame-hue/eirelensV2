/**
 * Cascade de Torc (Kerry) — dans les bois du parc national de Killarney.
 * Exemple d'utilisation de la brique `waterfall` (sceneryKit) + animation.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { waterfall, animateScenery } from '../../models/sceneryKit';

const H = 10; // hauteur de chute
const W = 4.5; // largeur

export const torcWaterfall: LandmarkDef = {
  id: 'torc_waterfall',
  name: 'Cascade de Torc',
  county: 'Kerry',
  province: 'Munster',
  category: 'nature',
  tier: 'bonus',
  // Coordonnées approximatives (à vérifier sur Google Maps)
  lat: 52.0055,
  lon: -9.5068,
  rotationDeg: 190, // la chute regarde vers Muckross
  description: 'Une cascade de 20 mètres qui dévale les rochers moussus de la forêt de Killarney.',
  funFact: '« Torc » signifie « sanglier » en irlandais : une légende raconte qu’un homme changé en sanglier vivait près de la cascade.',
  status: 'done',
  photo: { focus: [0, H / 2, -0.5], radius: H / 2 + 1, minDistance: 6, maxDistance: 120, bestHours: [8, 11] },
  clearRadius: 18,
  terrain: [{ kind: 'flatten', radius: 14, blend: 10 }],
  colliders: [
    { kind: 'box', x: 0, z: -4.5, hw: (W + 10) / 2, hd: 4.5, rot: 0 },
    { kind: 'circle', x: 0, z: 4.2, r: W * 0.8 + 2.3 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    waterfall(root, b, ctx, { height: H, width: W, steps: 3 });
    // Passerelle en bois et panneau du sentier, devant le bassin
    b.box(1.6, 0.15, 6, 'wood', { x: 9, y: 0.4, z: 7 });
    for (const z of [4.5, 9.5]) for (const s of [-1, 1]) b.box(0.12, 1.1, 0.12, 'woodDark', { x: 9 + s * 0.75, z });
    b.box(0.15, 1.6, 0.15, 'woodDark', { x: -8, z: 9 });
    b.box(1.2, 0.5, 0.08, 'woodDark', { x: -8, y: 1.3, z: 9 });
    root.add(b.mesh());
    return root;
  },
  animate: animateScenery,
};
