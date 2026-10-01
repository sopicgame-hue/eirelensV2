/**
 * Ha'penny Bridge + Temple Bar (Dublin) — passerelle en fonte blanche de 1816
 * au-dessus de la Liffey (côté +Z), avec ses trois arceaux à lanternes ; derrière
 * l'origine (rive sud, −Z), le Merchant's Arch et les façades de pubs de Temple Bar.
 * (Temple Bar est à 100 m du pont : à l'échelle du jeu, les deux forment un seul lieu.)
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { sharedMaterials } from '../../models/materials';
import { beam } from '../../models/sceneryKit';

const Z0 = 0; // départ du pont (quai sud)
const Z1 = 8.5; // arrivée (quai nord) — la Liffey du jeu fait ~5 u de large (z 2 → 6)
const ARCH_UP = 1.0; // bombement du tablier

export const hapennyBridge: LandmarkDef = {
  id: 'hapenny_bridge',
  name: 'Ha’penny Bridge et Temple Bar',
  county: 'Dublin',
  province: 'Leinster',
  category: 'ville',
  tier: 'secondaire',
  // Rive sud de la Liffey, au pied du pont (le pont lui-même est en 53.3461, -6.2630)
  lat: 53.3439,
  lon: -6.263,
  rotationDeg: 180, // +Z : traverse la Liffey vers le nord
  description: 'La passerelle en fonte de 1816, surnommée ainsi pour son péage d’un demi-penny ; derrière elle, le Merchant’s Arch mène aux pubs colorés de Temple Bar.',
  funFact: 'Son vrai nom est le « Liffey Bridge ». Le péage — un demi-penny, puis un penny et demi — n’a été supprimé qu’en 1919.',
  status: 'done',
  photo: { focus: [0, 2, 4.25], radius: 7, minDistance: 8, maxDistance: 180, bestHours: [19.5, 22] },
  clearRadius: 18,
  colliders: [
    { kind: 'box', x: 0, z: -6.5, hw: 5.5, hd: 2.5, rot: 0 },
    { kind: 'box', x: -10, z: -8.5, hw: 3.6, hd: 3, rot: 0 },
    { kind: 'box', x: 10, z: -8.5, hw: 3.6, hd: 3, rot: 0 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    const base = Math.max(0.25, ctx.waterY + 1.4);
    const deckY = (z: number) => base + ARCH_UP * Math.sin(((z - Z0) / (Z1 - Z0)) * Math.PI);

    // Tablier bombé (segments) + garde-corps en fonte blanche ajourée
    const N = 10;
    for (let i = 0; i < N; i++) {
      const za = Z0 + ((Z1 - Z0) * i) / N;
      const zb = Z0 + ((Z1 - Z0) * (i + 1)) / N;
      const ya = deckY(za);
      const yb = deckY(zb);
      const len = Math.hypot(zb - za, yb - ya) + 0.05;
      b.box(3.2, 0.2, len, 'woodDark', { z: (za + zb) / 2, y: (ya + yb) / 2 - 0.1, rx: -Math.atan2(yb - ya, zb - za) });
      for (const s of [-1, 1]) {
        beam(b, s * 1.6, ya + 1.0, za, s * 1.6, yb + 1.0, zb, 0.05, 'white', 4); // main courante
        b.box(0.06, 1.0, 0.06, 'white', { x: s * 1.6, y: ya, z: za }); // barreaux
        b.box(0.05, 0.05, len, 'white', { x: s * 1.6, y: (ya + yb) / 2 + 0.45, z: (za + zb) / 2, rx: -Math.atan2(yb - ya, zb - za) });
      }
    }
    // Trois nervures d'arc en fonte sous le tablier (arc surbaissé)
    for (const x of [-1.2, 0, 1.2]) {
      const pts = 10;
      for (let i = 0; i < pts; i++) {
        const t0 = i / pts;
        const t1 = (i + 1) / pts;
        const z0 = Z0 + 0.5 + t0 * (Z1 - Z0 - 1);
        const z1 = Z0 + 0.5 + t1 * (Z1 - Z0 - 1);
        const y0 = ctx.waterY + 0.3 + (deckY(z0) - 0.3 - ctx.waterY - 0.3) * Math.sin(t0 * Math.PI);
        const y1 = ctx.waterY + 0.3 + (deckY(z1) - 0.3 - ctx.waterY - 0.3) * Math.sin(t1 * Math.PI);
        beam(b, x, y0, z0, x, y1, z1, 0.12, 'white', 5);
      }
    }
    // Trois arceaux à lanterne au-dessus du tablier
    const lanterns = new ModelBuilder();
    for (const z of [Z0 + 1.5, (Z0 + Z1) / 2, Z1 - 1.5]) {
      const y = deckY(z);
      for (const s of [-1, 1]) b.box(0.12, 1.3, 0.12, 'white', { x: s * 1.6, y: y + 0.9, z });
      b.add(new THREE.TorusGeometry(1.6, 0.06, 4, 10, Math.PI), 'white', { y: y + 2.2, z });
      b.box(0.08, 0.5, 0.08, 'black', { y: y + 3.6, z });
      lanterns.box(0.45, 0.55, 0.45, 'white', { y: y + 3.1, z });
    }
    // Quais de pierre sur les deux rives
    b.box(36, 0.8, 1.2, 'stone', { z: Z0 + 0.2, y: -0.6 });
    b.box(36, 0.8, 1.2, 'stone', { z: Z1, y: ctx.groundAt(0, Z1 + 1) - 0.6 });

    // Rive sud : Merchant's Arch (passage voûté) face au pont
    b.push({ z: -6.5 });
    b.arch(11, 7, 4.8, 2.6, 3.6, 'stoneLight');
    b.box(11.4, 0.4, 5.2, 'stone', { y: 7 });
    for (const x of [-3.6, 3.6]) for (const y of [4.2, 5.8]) b.box(1.1, 1.1, 0.1, 'window', { x, y, z: 2.42 });
    b.pop();
    // Pubs de Temple Bar de part et d'autre (le rouge = "The Temple Bar")
    const pubs: [number, 'facadeA' | 'facadeB' | 'facadeD'][] = [
      [-10, 'facadeA'],
      [10, 'facadeB'],
    ];
    for (const [x, color] of pubs) {
      b.push({ x, z: -8.5 });
      b.box(7, 7.5, 6, color);
      b.roof(7.3, 2, 6.4, 'slate', { y: 7.5 });
      b.box(7.1, 2.6, 0.12, 'black', { z: 3.03 });
      b.box(6.4, 0.6, 0.14, 'gold', { y: 2.1, z: 3.05 });
      b.box(2, 1.4, 0.14, 'glass', { x: -2, y: 0.6, z: 3.06 });
      b.box(1.1, 2, 0.14, 'door', { x: 1.6, z: 3.06 });
      for (const wx of [-2.2, 0, 2.2]) b.box(1, 1.3, 0.1, 'window', { x: wx, y: 4, z: 3.02 });
      for (const wx of [-2.2, 0, 2.2]) b.sphere(0.35, 'facadeE', { x: wx, y: 3.4, z: 3.3 }, 0); // paniers fleuris
      b.pop();
    }
    root.add(b.mesh());
    root.add(lanterns.mesh(sharedMaterials().glow));
    return root;
  },
};
