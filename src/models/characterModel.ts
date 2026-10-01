/**
 * Personnage "chibi" low-poly (grosse tête, petit corps) façon Pokémon 3DS.
 * Hiérarchie animable :
 *   root
 *    ├─ hips (bassin)          ← legL / legR (pivots aux hanches)
 *    └─ torso (buste)          ← armL / armR (pivots aux épaules), head (pivot au cou)
 * Toutes les pièces sont construites avec ModelBuilder + matériau "character".
 * Hauteur totale ≈ 1.6 u. L'avant du personnage regarde vers +Z.
 */
import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder';
import { sharedMaterials } from './materials';
import { Customization } from '../content/customization';

export interface CharacterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  /** Petit appareil photo tenu en mode photo. */
  camera: THREE.Object3D;
}

function part(b: ModelBuilder) {
  const m = new THREE.Mesh(b.build(), sharedMaterials().character);
  m.castShadow = true;
  return m;
}

export function buildCharacter(c: Customization): CharacterRig {
  const slim = c.body === 'b';
  const root = new THREE.Group();
  root.name = 'player';
  const b = new ModelBuilder();

  // ---- Bassin + jambes
  const hips = new THREE.Group();
  hips.position.y = 0.55;
  root.add(hips);
  b.box(slim ? 0.42 : 0.4, 0.18, 0.26, c.bottom, { y: -0.08 });
  hips.add(part(b));

  const makeLeg = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * 0.11, -0.05, 0);
    b.cylinder(0.075, 0.07, 0.4, c.bottom, { y: -0.42 }, 6);
    b.box(0.15, 0.1, 0.24, c.shoes, { y: -0.5, z: 0.03 });
    g.add(part(b));
    hips.add(g);
    return g;
  };
  const legL = makeLeg(1);
  const legR = makeLeg(-1);

  // ---- Buste
  const torso = new THREE.Group();
  torso.position.y = 0.55;
  root.add(torso);
  b.cylinder(slim ? 0.17 : 0.2, slim ? 0.2 : 0.21, 0.42, c.top, {}, 8);
  b.cylinder(0.08, 0.08, 0.06, c.skin, { y: 0.42 }, 6); // cou
  torso.add(part(b));

  const makeArm = (side: number) => {
    const g = new THREE.Group();
    g.position.set(side * (slim ? 0.22 : 0.25), 0.36, 0);
    b.cylinder(0.06, 0.055, 0.32, c.top, { y: -0.32 }, 6);
    b.sphere(0.065, c.skin, { y: -0.36 }, 0);
    g.add(part(b));
    torso.add(g);
    return g;
  };
  const armL = makeArm(1);
  const armR = makeArm(-1);

  // Appareil photo (visible seulement en mode photo)
  b.box(0.2, 0.13, 0.1, 'black');
  b.cylinder(0.04, 0.045, 0.06, 0x444444, { z: 0.08, rx: Math.PI / 2 }, 8);
  const camera = part(b);
  camera.position.set(0, 0.62, 0.25);
  camera.visible = false;
  torso.add(camera);

  // ---- Tête
  const head = new THREE.Group();
  head.position.y = 0.46;
  torso.add(head);
  b.sphere(0.34, c.skin, { y: 0.3, sx: 1, sy: 0.95, sz: 0.95 }, 1);
  // Yeux + joues
  for (const s of [-1, 1]) {
    b.box(0.06, slim ? 0.11 : 0.1, 0.02, 'black', { x: s * 0.12, y: 0.3, z: 0.315 });
    b.box(0.025, 0.03, 0.02, 'white', { x: s * 0.12 + 0.015, y: 0.335, z: 0.325 });
    b.box(0.07, 0.035, 0.02, 'pink', { x: s * 0.2, y: 0.2, z: 0.29, ry: s * 0.4 });
  }
  addHair(b, c);
  addHat(b, c);
  head.add(part(b));

  return { root, hips, torso, head, armL, armR, legL, legR, camera };
}

function addHair(b: ModelBuilder, c: Customization) {
  const col = c.hairColor;
  switch (c.hairStyle) {
    case 'short':
      b.sphere(0.355, col, { y: 0.4, z: -0.07, sy: 0.82 }, 1);
      b.box(0.46, 0.08, 0.12, col, { y: 0.55, z: 0.2, rx: -0.4 });
      break;
    case 'long':
      b.sphere(0.36, col, { y: 0.4, z: -0.07, sy: 0.85 }, 1);
      b.box(0.62, 0.5, 0.22, col, { y: 0.0, z: -0.16 });
      b.box(0.5, 0.08, 0.12, col, { y: 0.53, z: 0.22, rx: -0.3 });
      break;
    case 'bun':
      b.sphere(0.355, col, { y: 0.4, z: -0.07, sy: 0.82 }, 1);
      b.sphere(0.14, col, { y: 0.7, z: -0.12 }, 1);
      break;
    case 'curly':
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        b.sphere(0.13, col, { x: Math.cos(a) * 0.27, y: 0.48 + Math.sin(i) * 0.04, z: Math.sin(a) * 0.24 - 0.05 }, 0);
      }
      b.sphere(0.3, col, { y: 0.45, z: -0.05, sy: 0.7 }, 1);
      break;
    case 'bald':
      break;
  }
}

function addHat(b: ModelBuilder, c: Customization) {
  const col = c.hatColor;
  switch (c.hat) {
    case 'flatcap':
      b.cylinder(0.33, 0.36, 0.1, col, { y: 0.56, z: -0.02 }, 10);
      b.box(0.4, 0.04, 0.22, col, { y: 0.57, z: 0.3, rx: 0.15 });
      break;
    case 'beanie':
      b.sphere(0.36, col, { y: 0.45, sy: 0.75 }, 1);
      b.cylinder(0.37, 0.37, 0.1, col, { y: 0.4 }, 10);
      b.sphere(0.08, 'white', { y: 0.74 }, 0);
      break;
    case 'bucket':
      b.cylinder(0.3, 0.33, 0.2, col, { y: 0.5 }, 10);
      b.cylinder(0.48, 0.5, 0.04, col, { y: 0.5 }, 12);
      break;
    case 'none':
      break;
  }
}

export function disposeCharacter(rig: CharacterRig) {
  rig.root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
  });
}
