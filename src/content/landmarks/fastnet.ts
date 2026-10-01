/**
 * Phare du Fastnet (Cork) — tour de granite sur un rocher en pleine mer.
 * Accessible uniquement en currach. Le rocher est un tampon "island".
 * La lanterne (brique lighthouse) utilise le matériau partagé "glow" : elle brille la nuit.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { lighthouse } from '../../models/landmarkKit';

export const fastnet: LandmarkDef = {
  id: 'fastnet',
  name: 'Phare du Fastnet',
  county: 'Cork',
  province: 'Munster',
  category: 'phare',
  lat: 51.389,
  lon: -9.603,
  requires: 'boat',
  description: 'Le phare le plus au sud de l’Irlande, dressé sur un rocher isolé en pleine mer.',
  funFact: 'On le surnomme « la larme de l’Irlande » : c’était la dernière terre irlandaise que voyaient les émigrants partant pour l’Amérique.',
  status: 'done',
  photo: { focus: [0, 8, 0], radius: 9, minDistance: 12, maxDistance: 380, bestHours: [20, 22] },
  clearRadius: 10,
  terrain: [{ kind: 'island', radius: 7, height: 2.5, blend: 7 }],
  colliders: [{ kind: 'circle', x: 0, z: 0, r: 2.4 }],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Rochers autour du socle
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const x = Math.cos(a) * 4.5;
      const z = Math.sin(a) * 4.5;
      b.sphere(1.4 + ctx.rng(), 'rockDark', { x, z, y: Math.max(ctx.groundAt(x, z), ctx.waterY) - 0.3, sy: 0.7 }, 0);
    }
    // Socle + phare en granite gris (brique du kit, avec lanterne lumineuse)
    b.cylinder(2.6, 2.9, 1.2, 'stone', { y: -0.5 }, 14);
    lighthouse(b, { y: 0.7, height: 13, radius: 2.3, color: 'stoneLight', bandColor: 'stone', bands: 4 }, root);
    root.add(b.mesh());
    return root;
  },
};
