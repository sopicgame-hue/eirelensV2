/**
 * Le BATEAU du jeu : un currach, la barque traditionnelle de la côte ouest
 * (coque noire goudronnée). Indispensable pour rejoindre les îles
 * (Aran, Skellig Michael, Fastnet…). Se met à l'eau depuis n'importe quel rivage.
 * (L'id reste 'currach' : ne jamais changer un id, il est dans les sauvegardes.)
 */
import * as THREE from 'three';
import { VehicleDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const currach: VehicleDef = {
  id: 'currach',
  name: 'Bateau (currach)',
  description: 'La barque goudronnée des pêcheurs de l’Ouest. Direction les îles !',
  icon: '🛶',
  price: 600,
  medium: 'water',
  maxSpeed: 20,
  acceleration: 7,
  turnRate: 1.8,
  maxSlope: 0,
  radius: 1.2,
  rider: { offset: [0, 0.25, -0.6], pose: 'sit' },
  sheepSeat: { offset: [0, 0.55, 1.1], scale: 0.7 },
  cameraDistance: 15,
  build() {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Coque : boîtes qui s'affinent vers la proue
    b.box(1.4, 0.5, 2.6, 'boatHull', { y: -0.1 });
    b.box(1.0, 0.5, 0.9, 'boatHull', { y: -0.05, z: 1.6 });
    b.box(0.5, 0.55, 0.6, 'boatHull', { y: 0.0, z: 2.2, rx: -0.15 });
    b.box(1.0, 0.45, 0.6, 'boatHull', { y: -0.1, z: -1.55 });
    b.box(1.3, 0.06, 2.4, 'wood', { y: 0.32 }); // plat-bord intérieur
    b.box(1.3, 0.1, 0.25, 'woodDark', { y: 0.2, z: 0.4 }); // banc
    b.box(1.3, 0.1, 0.25, 'woodDark', { y: 0.2, z: -0.8 });
    // Rames
    for (const s of [-1, 1]) b.box(0.08, 0.08, 2.6, 'wood', { x: s * 0.95, y: 0.35, z: -0.4, ry: s * 0.35 });
    const hull = b.mesh();
    hull.name = 'hull';
    root.add(hull);
    return root;
  },
  animate(model, _speed, _dt, time) {
    const hull = model.getObjectByName('hull');
    if (hull) {
      hull.rotation.z = Math.sin(time * 1.3) * 0.04;
      hull.rotation.x = Math.sin(time * 0.9) * 0.025;
    }
  },
};
