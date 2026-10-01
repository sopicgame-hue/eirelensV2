/**
 * ULM pendulaire (aile delta + chariot à trois roues). Le seul véhicule VOLANT.
 *   - au sol, il roule comme un véhicule terrestre ;
 *   - au-delà de `flight.takeoffSpeed`, il décolle et suit le relief à
 *     `flight.cruiseHeight` unités au-dessus du sol (montagnes comprises) ;
 *   - stick relâché au-dessus de la terre : il ralentit et atterrit tout seul ;
 *     au-dessus de l'eau, il continue de planer doucement (jamais d'amerrissage).
 * Le mouton voyage SUSPENDU sous le chariot, dans un harnais, pattes dans le vide.
 * Les murs des zones verrouillées s'appliquent aussi dans le ciel.
 */
import * as THREE from 'three';
import { VehicleDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const POD_Y = 1.35; // bas du chariot (assez haut pour que le mouton pende dessous)

export const ulm: VehicleDef = {
  id: 'ulm',
  name: 'ULM',
  description: 'Un ULM pendulaire tout en toile rouge et jaune. Vue imprenable… Paddy, lui, voyage suspendu en dessous.',
  icon: '🪂',
  price: 1200,
  medium: 'air',
  maxSpeed: 30,
  acceleration: 8,
  turnRate: 1.6,
  maxSlope: 0.5,
  radius: 1.4,
  rider: { offset: [0, POD_Y + 0.05, -0.2], pose: 'sit' },
  sheepSeat: { offset: [0, 0.95, 0.15], scale: 0.6, pose: 'hang' },
  flight: { cruiseHeight: 32, takeoffSpeed: 13, climbRate: 9 },
  cameraDistance: 18,
  build() {
    const root = new THREE.Group();
    const b = new ModelBuilder();

    // --- Chariot (fixe)
    b.box(0.9, 0.45, 1.7, 'ulmPod', { y: POD_Y, z: 0.05 }); // baquet
    b.box(0.7, 0.35, 0.5, 'ulmPod', { y: POD_Y + 0.05, z: 1.05, rx: -0.35 }); // nez
    b.box(0.86, 0.06, 0.4, 'glass', { y: POD_Y + 0.5, z: 0.75, rx: -0.6 }); // pare-brise
    b.box(0.5, 0.5, 0.12, 'black', { y: POD_Y + 0.35, z: -0.55 }); // dossier
    b.box(0.5, 0.45, 0.5, 'slate', { y: POD_Y + 0.05, z: -0.95 }); // moteur
    // Train : roue avant + 2 roues arrière sur jambes de force
    b.box(0.06, POD_Y - 0.3, 0.06, 'chrome', { y: 0.3, z: 1.2, rx: 0.15 });
    b.cylinder(0.3, 0.3, 0.14, 'tyre', { y: 0.0, z: 1.25, rz: Math.PI / 2, x: 0.07 }, 10);
    for (const s of [-1, 1]) {
      b.box(0.06, 0.06, 1.0, 'chrome', { x: s * 0.45, y: POD_Y - 0.15, z: -0.55, ry: s * 0.0, rz: s * 0.9 });
      b.box(0.06, POD_Y - 0.25, 0.06, 'chrome', { x: s * 0.85, y: 0.3, z: -0.55 });
      b.cylinder(0.32, 0.32, 0.16, 'tyre', { x: s * 0.85 + s * 0.08, y: 0.0, z: -0.55, rz: Math.PI / 2 }, 10);
    }
    // Mât + barre de contrôle (trapèze)
    b.cylinder(0.05, 0.06, 2.6, 'chrome', { y: POD_Y + 0.3, z: -0.35, rx: 0.08 }, 6);
    for (const s of [-1, 1]) b.cylinder(0.03, 0.03, 1.7, 'chrome', { x: s * 0.1, y: POD_Y + 0.85, z: 0.15, rz: s * 0.45, rx: -0.35 }, 5);
    b.cylinder(0.03, 0.03, 1.5, 'chrome', { x: -0.75, y: POD_Y + 0.62, z: 0.55, rz: Math.PI / 2 }, 5);
    // Harnais du mouton : sangle + 4 cordes vers le chariot
    b.box(0.62, 0.06, 0.62, 'leather', { y: 0.66, z: 0.15 });
    for (const [x, z] of [
      [0.28, 0.42],
      [-0.28, 0.42],
      [0.28, -0.12],
      [-0.28, -0.12],
    ])
      b.cylinder(0.02, 0.02, POD_Y - 0.7, 'rope', { x, y: 0.7, z }, 4);
    const pod = b.mesh();
    pod.name = 'pod';
    root.add(pod);

    // --- Aile (groupe séparé : elle s'incline dans les virages)
    const wing = new THREE.Group();
    wing.name = 'wing';
    wing.position.set(0, POD_Y + 2.85, -0.2);
    for (const s of [-1, 1]) {
      // demi-aile en flèche : bord d'attaque coloré + toile
      b.push({ ry: s * 0.55 });
      b.box(4.6, 0.06, 1.5, 'ulmWing', { x: s * 2.3, z: -0.75 });
      b.box(4.6, 0.07, 0.35, 'ulmWingStripe', { x: s * 2.3, z: 0.0 });
      b.pop();
    }
    b.box(0.08, 0.08, 2.6, 'chrome', { y: -0.05, z: -1.3 }); // quille
    b.cone(0.5, 1.4, 'ulmWing', { y: -0.02, z: 0.2, rx: Math.PI / 2, sy: 1, sz: 0.06 }, 3); // nez de l'aile
    wing.add(b.mesh());
    root.add(wing);

    // --- Hélice (tourne)
    const prop = new THREE.Group();
    prop.name = 'prop';
    prop.position.set(0, POD_Y + 0.3, -1.25);
    b.box(0.12, 1.7, 0.05, 'woodDark', { y: -0.85 });
    b.sphere(0.1, 'chrome', {}, 0);
    prop.add(b.mesh());
    root.add(prop);

    root.userData.rig = { wing, prop, lastYaw: NaN, roll: 0 };
    return root;
  },
  animate(model, speed, dt, time) {
    const rig = model.userData.rig as { wing: THREE.Group; prop: THREE.Group; lastYaw: number; roll: number };
    if (!rig) return;
    rig.prop.rotation.z += (6 + speed * 1.5) * dt;
    // Inclinaison dans les virages (calculée à partir de la vitesse de rotation)
    if (Number.isNaN(rig.lastYaw)) rig.lastYaw = model.rotation.y; // pas de secousse à la montée à bord
    let dyaw = model.rotation.y - rig.lastYaw;
    if (dyaw > Math.PI) dyaw -= Math.PI * 2;
    if (dyaw < -Math.PI) dyaw += Math.PI * 2;
    rig.lastYaw = model.rotation.y;
    const target = dt > 0 ? Math.max(-0.45, Math.min(0.45, (-dyaw / dt) * 0.35)) : 0;
    rig.roll += (target - rig.roll) * Math.min(1, dt * 4);
    rig.wing.rotation.z = rig.roll * 0.6;
    model.rotation.z = rig.roll * 0.5;
    rig.wing.rotation.x = Math.sin(time * 1.7) * 0.02;
  },
};
