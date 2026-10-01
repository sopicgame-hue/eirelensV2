/**
 * Vélo hollandais vert avec panier à l'avant… pour le mouton.
 */
import * as THREE from 'three';
import { VehicleDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const bicycle: VehicleDef = {
  id: 'bicycle',
  name: 'Vélo à panier',
  description: 'Un vieux vélo vert avec un grand panier. Paddy y tient tout juste.',
  icon: '🚲',
  price: 150,
  medium: 'land',
  maxSpeed: 15,
  acceleration: 10,
  turnRate: 3.2,
  maxSlope: 0.9,
  radius: 0.7,
  rider: { offset: [0, 0.45, -0.35], pose: 'bike' },
  sheepSeat: { offset: [0, 1.05, 0.85], scale: 0.55 },
  cameraDistance: 12,
  build() {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Cadre
    b.box(0.08, 0.08, 1.15, 'bikeGreen', { y: 0.75, rx: 0.05 });
    b.box(0.08, 0.75, 0.08, 'bikeGreen', { y: 0.35, z: -0.35, rx: -0.2 });
    b.box(0.08, 0.8, 0.08, 'bikeGreen', { y: 0.35, z: 0.55, rx: 0.25 });
    b.box(0.3, 0.08, 0.4, 'black', { y: 1.08, z: -0.38 }); // selle
    b.box(0.7, 0.06, 0.06, 'chrome', { y: 1.18, z: 0.62 }); // guidon
    // Panier
    b.box(0.6, 0.35, 0.5, 'wood', { y: 0.85, z: 0.85 });
    root.add(b.mesh());
    // Roues (animées)
    for (const z of [-0.55, 0.65]) {
      b.cylinder(0.42, 0.42, 0.06, 'tyre', { rz: Math.PI / 2, x: 0.03 }, 12);
      b.cylinder(0.08, 0.08, 0.1, 'chrome', { rz: Math.PI / 2, x: 0.05 }, 6);
      const w = b.mesh();
      w.position.set(0, 0.42, z);
      w.name = 'wheel';
      root.add(w);
    }
    return root;
  },
  animate(model, speed, dt) {
    model.children.forEach((c) => {
      if (c.name === 'wheel') c.rotation.x += (speed / 0.42) * dt;
    });
  },
};
