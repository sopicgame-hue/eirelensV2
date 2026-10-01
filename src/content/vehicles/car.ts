/**
 * Petite voiture rétro crème et rouge (esprit Mini des années 60).
 * Le mouton voyage sur la banquette, la tête par la fenêtre.
 */
import * as THREE from 'three';
import { VehicleDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const car: VehicleDef = {
  id: 'car',
  name: 'Mini rétro',
  description: 'Une petite voiture des années 60. Les routes de campagne n’ont jamais été aussi rapides.',
  icon: '🚗',
  unlockAt: 5,
  medium: 'land',
  maxSpeed: 32,
  acceleration: 14,
  turnRate: 2.2,
  maxSlope: 0.75,
  radius: 1.3,
  rider: { offset: [0.35, 0.55, 0.05], pose: 'hidden' },
  sheepSeat: { offset: [-0.4, 0.95, 0.0], scale: 0.6 },
  cameraDistance: 14,
  build() {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    b.box(1.7, 0.7, 3.2, 'carCream', { y: 0.35 });
    b.box(1.5, 0.6, 1.8, 'carCream', { y: 1.05, z: -0.15 });
    b.box(1.55, 0.1, 1.85, 'carRed', { y: 1.65, z: -0.15 }); // toit
    b.box(1.52, 0.45, 0.05, 'glass', { y: 1.1, z: 0.76, rx: -0.2 }); // pare-brise
    b.box(1.52, 0.4, 0.05, 'glass', { y: 1.1, z: -1.06, rx: 0.2 });
    for (const s of [-1, 1]) {
      b.box(0.05, 0.4, 1.4, 'glass', { x: s * 0.76, y: 1.12, z: -0.15 });
      b.box(0.25, 0.18, 0.05, 'gold', { x: s * 0.55, y: 0.65, z: 1.61 }); // phares
      b.box(0.25, 0.14, 0.05, 'carRed', { x: s * 0.6, y: 0.65, z: -1.61 });
    }
    b.box(1.75, 0.18, 0.15, 'chrome', { y: 0.3, z: 1.62 });
    b.box(1.75, 0.18, 0.15, 'chrome', { y: 0.3, z: -1.62 });
    b.box(0.9, 0.06, 2.3, 'carRed', { y: 0.72, z: 0.4 }); // bande capot
    root.add(b.mesh());
    for (const [x, z] of [
      [0.82, 1.05],
      [-0.82, 1.05],
      [0.82, -1.05],
      [-0.82, -1.05],
    ]) {
      b.cylinder(0.36, 0.36, 0.28, 'tyre', { rz: Math.PI / 2 }, 10);
      b.cylinder(0.18, 0.18, 0.3, 'chrome', { rz: Math.PI / 2 }, 8);
      const w = b.mesh();
      w.position.set(x, 0.36, z);
      w.name = 'wheel';
      root.add(w);
    }
    return root;
  },
  animate(model, speed, dt) {
    model.children.forEach((c) => {
      if (c.name === 'wheel') c.rotation.x += (speed / 0.36) * dt;
    });
  },
};
