/**
 * Cheval : un poney du Connemara, la race emblématique de l'Ouest irlandais.
 * Passe partout (pentes, tourbières), plus rapide que le vélo hors des routes.
 * Le mouton voyage assis sur la croupe, derrière la selle.
 *
 * Exemple de modèle ANIMÉ : chaque patte est un groupe dont le pivot est à
 * l'épaule / la hanche (la géométrie est construite VERS LE BAS depuis y = 0),
 * ce qui permet de la faire balancer avec rotation.x. Voir docs/GUIDE_MODELISATION.md.
 */
import * as THREE from 'three';
import { VehicleDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const LEG_TOP = 1.05; // hauteur des épaules / hanches (pivots des pattes)
const LEG_LEN = 1.0;

export const horse: VehicleDef = {
  id: 'horse',
  name: 'Cheval',
  description: 'Un poney du Connemara, robuste et placide. Il passe partout, et Paddy adore voyager sur sa croupe.',
  icon: '🐎',
  price: 450,
  medium: 'land',
  maxSpeed: 19,
  acceleration: 9,
  turnRate: 3.0,
  maxSlope: 1.3,
  radius: 0.9,
  rider: { offset: [0, 1.36, -0.1], pose: 'ride' }, // bassin (offset + 0,55) juste au-dessus de la selle
  sheepSeat: { offset: [0, 1.98, -0.85], scale: 0.55, pose: 'sit' },
  cameraDistance: 13,
  build() {
    const root = new THREE.Group();
    const b = new ModelBuilder();

    // --- Corps (un seul mesh) : tronc, encolure, selle
    b.sphere(0.5, 'horseCoat', { y: 1.38, sx: 0.88, sy: 0.82, sz: 1.9 }, 1);
    b.sphere(0.42, 'horseShade', { y: 1.3, z: -0.55, sx: 0.98, sy: 0.95, sz: 1.1 }, 1); // croupe
    b.sphere(0.4, 'horseCoat', { y: 1.4, z: 0.6, sx: 0.95, sy: 1, sz: 1 }, 1); // poitrail
    b.box(0.42, 1.0, 0.5, 'horseCoat', { y: 1.45, z: 0.82, rx: 0.55 }); // encolure
    b.box(0.12, 0.9, 0.28, 'horseMane', { y: 1.62, z: 0.66, rx: 0.55 }); // crinière
    // Selle + tapis vert + étriers
    b.box(0.95, 0.06, 0.9, 'saddleCloth', { y: 1.74, z: -0.05 });
    b.box(0.6, 0.14, 0.62, 'leather', { y: 1.78, z: -0.05 });
    b.box(0.5, 0.18, 0.12, 'leather', { y: 1.84, z: 0.22 }); // pommeau
    for (const s of [-1, 1]) {
      b.box(0.03, 0.55, 0.05, 'leather', { x: s * 0.42, y: 1.22, z: 0.0 });
      b.box(0.12, 0.04, 0.16, 'chrome', { x: s * 0.44, y: 1.2, z: 0.0 });
    }
    const body = b.mesh();
    body.name = 'body';
    root.add(body);

    // --- Tête (pivot à la nuque, pour hocher la tête)
    const head = new THREE.Group();
    head.name = 'head';
    head.position.set(0, 2.15, 1.2);
    b.box(0.3, 0.32, 0.72, 'horseCoat', { y: -0.2, z: 0.18, rx: 0.5 });
    b.box(0.26, 0.24, 0.3, 'horseShade', { y: -0.52, z: 0.5, rx: 0.5 }); // museau
    for (const s of [-1, 1]) {
      b.cone(0.07, 0.22, 'horseCoat', { x: s * 0.1, y: 0.05, z: -0.05 }, 4); // oreilles
      b.sphere(0.045, 'black', { x: s * 0.16, y: -0.12, z: 0.18 }, 0); // yeux
    }
    b.box(0.1, 0.3, 0.2, 'horseMane', { y: -0.05, z: 0.05, rx: 0.3 }); // toupet
    b.box(0.34, 0.05, 0.05, 'leather', { y: -0.35, z: 0.42, rx: 0.5 }); // bride
    head.add(b.mesh());
    root.add(head);

    // --- Pattes (pivot en haut, géométrie vers le bas)
    const legs: THREE.Group[] = [];
    for (const [x, z] of [
      [0.26, 0.62],
      [-0.26, 0.62],
      [0.26, -0.68],
      [-0.26, -0.68],
    ]) {
      const g = new THREE.Group();
      g.position.set(x, LEG_TOP + 0.15, z);
      b.cylinder(0.11, 0.08, LEG_LEN * 0.55, 'horseCoat', { y: -LEG_LEN * 0.55 }, 6);
      b.cylinder(0.07, 0.07, LEG_LEN * 0.5, 'horseShade', { y: -LEG_LEN - 0.05 }, 6);
      b.cylinder(0.1, 0.11, 0.12, 'hoof', { y: -LEG_LEN - 0.17 }, 6);
      g.add(b.mesh());
      root.add(g);
      legs.push(g);
    }

    // --- Queue
    const tail = new THREE.Group();
    tail.position.set(0, 1.6, -1.0);
    b.cylinder(0.1, 0.16, 0.9, 'horseMane', { y: -0.9, rx: 0.25 }, 6);
    tail.add(b.mesh());
    root.add(tail);

    root.userData.rig = { legs, head, tail, body, phase: 0 };
    return root;
  },
  animate(model, speed, dt, time) {
    const rig = model.userData.rig as { legs: THREE.Group[]; head: THREE.Group; tail: THREE.Group; body: THREE.Mesh; phase: number };
    if (!rig) return;
    rig.phase += speed * dt * 1.15;
    const k = Math.min(1, speed / 6); // amplitude : pas → galop
    const s = Math.sin(rig.phase);
    const c = Math.cos(rig.phase);
    // Trot : pattes en diagonale synchronisées
    rig.legs[0].rotation.x = s * 0.7 * k;
    rig.legs[3].rotation.x = s * 0.7 * k;
    rig.legs[1].rotation.x = -s * 0.7 * k;
    rig.legs[2].rotation.x = -s * 0.7 * k;
    const bob = Math.abs(c) * 0.12 * k;
    rig.body.position.y = bob;
    rig.head.position.y = 2.15 + bob;
    rig.head.rotation.x = Math.sin(rig.phase * 2) * 0.12 * k + (speed < 0.5 ? Math.sin(time * 0.6) * 0.08 + 0.1 : 0);
    rig.tail.rotation.x = 0.2 + k * 0.5;
    rig.tail.rotation.z = Math.sin(time * 3) * 0.15;
  },
};
