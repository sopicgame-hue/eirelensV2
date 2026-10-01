/**
 * Le mouton de compagnie (et ses accessoires). L'avant regarde vers +Z.
 * Hiérarchie animable : root → body (laine) → head, legs[4], tail.
 * Taille : ~1.1 u de haut, ~1.4 u de long (on peut monter dessus, c'est drôle).
 */
import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder';
import { sharedMaterials } from './materials';
import { SheepAccessoryId } from '../content/customization';

export interface SheepRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  legs: THREE.Group[];
  tail: THREE.Group;
  /** Point où s'assoit le joueur quand il chevauche le mouton. */
  saddle: THREE.Object3D;
}

function part(b: ModelBuilder) {
  const m = new THREE.Mesh(b.build(), sharedMaterials().character);
  m.castShadow = true;
  return m;
}

export function buildSheep(accessory: SheepAccessoryId, accessoryColor: number): SheepRig {
  const b = new ModelBuilder();
  const root = new THREE.Group();
  root.name = 'sheep';

  const body = new THREE.Group();
  body.position.y = 0.62;
  root.add(body);
  // Laine : grappe de boules
  b.sphere(0.5, 'wool', { sx: 1, sy: 0.85, sz: 1.25 }, 1);
  const puffs: [number, number, number, number][] = [
    [0.3, 0.25, 0.35, 0.3],
    [-0.3, 0.25, 0.35, 0.3],
    [0.32, 0.22, -0.3, 0.3],
    [-0.32, 0.22, -0.3, 0.3],
    [0, 0.38, 0, 0.34],
    [0, 0.3, 0.5, 0.28],
    [0, 0.25, -0.55, 0.28],
    [0.42, 0, 0, 0.28],
    [-0.42, 0, 0, 0.28],
  ];
  for (const [x, y, z, r] of puffs) b.sphere(r, 'woolShade', { x, y, z }, 0);
  b.sphere(0.48, 'wool', { y: 0.06, sx: 1.02, sy: 0.85, sz: 1.27 }, 1);
  body.add(part(b));

  const saddle = new THREE.Object3D();
  saddle.position.set(0, 0.42, -0.05);
  body.add(saddle);

  // Tête
  const head = new THREE.Group();
  head.position.set(0, 0.2, 0.62);
  body.add(head);
  b.sphere(0.24, 'sheepFace', { y: 0.05, z: 0.12, sx: 0.85, sy: 1, sz: 1.15 }, 1);
  b.sphere(0.2, 'wool', { y: 0.25, z: 0.02 }, 0); // toupet
  for (const s of [-1, 1]) {
    b.box(0.22, 0.07, 0.1, 'sheepFace', { x: s * 0.26, y: 0.12, z: 0.02, rz: s * -0.4 }); // oreilles
    b.sphere(0.055, 'white', { x: s * 0.1, y: 0.12, z: 0.32 }, 0); // yeux
    b.sphere(0.028, 'black', { x: s * 0.1, y: 0.12, z: 0.37 }, 0);
  }
  addAccessoryOnHead(b, accessory, accessoryColor);
  head.add(part(b));

  // Accessoire autour du cou (porté par le corps)
  if (accessory === 'scarf') {
    b.cylinder(0.3, 0.33, 0.14, accessoryColor, { y: 0.02, z: 0.5, rx: 0.5 }, 10);
    b.box(0.12, 0.38, 0.04, accessoryColor, { x: 0.16, y: -0.3, z: 0.62, rz: 0.1 });
    body.add(part(b));
  } else if (accessory === 'bowtie') {
    b.box(0.14, 0.12, 0.08, accessoryColor, { x: -0.1, y: -0.05, z: 0.72, rz: 0.3 });
    b.box(0.14, 0.12, 0.08, accessoryColor, { x: 0.1, y: -0.05, z: 0.72, rz: -0.3 });
    b.box(0.06, 0.07, 0.09, accessoryColor, { y: -0.03, z: 0.73 });
    body.add(part(b));
  }

  // Pattes (pivot en haut)
  const legs: THREE.Group[] = [];
  for (const [x, z] of [
    [0.24, 0.35],
    [-0.24, 0.35],
    [0.24, -0.35],
    [-0.24, -0.35],
  ]) {
    const g = new THREE.Group();
    g.position.set(x, 0.42, z);
    b.cylinder(0.06, 0.05, 0.42, 'sheepFace', { y: -0.42 }, 5);
    g.add(part(b));
    root.add(g);
    legs.push(g);
  }

  // Queue
  const tail = new THREE.Group();
  tail.position.set(0, 0.25, -0.62);
  b.sphere(0.12, 'wool', {}, 0);
  tail.add(part(b));
  body.add(tail);

  return { root, body, head, legs, tail, saddle };
}

function addAccessoryOnHead(b: ModelBuilder, accessory: SheepAccessoryId, color: number) {
  if (accessory === 'flatcap') {
    b.cylinder(0.2, 0.22, 0.07, color, { y: 0.33, z: 0.02 }, 10);
    b.box(0.24, 0.03, 0.14, color, { y: 0.34, z: 0.2, rx: 0.15 });
  }
}

export function disposeSheep(rig: SheepRig) {
  rig.root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
  });
}
