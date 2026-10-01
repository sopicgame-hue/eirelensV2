/**
 * Poll na bPéist, "le Wormhole" (Inis Mór, îles d'Aran) — un bassin naturel
 * parfaitement rectangulaire creusé dans le dallage calcaire, au bord des
 * falaises. La mer est côté +Z (rotationDeg). Accessible en bateau.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { sharedMaterials } from '../../models/materials';
import { cliffFace } from '../../models/landmarkKit';

const PW = 11; // longueur du bassin (axe X)
const PD = 4.5; // largeur (axe Z)
const PZ = 2.5; // centre du bassin en Z

export const wormholeAran: LandmarkDef = {
  id: 'wormhole_aran',
  name: 'Poll na bPéist (le Wormhole)',
  county: 'Galway',
  province: 'Connacht',
  category: 'nature',
  tier: 'principal',
  // Côte sud d'Inis Mór, décalé d'environ 1 km de Dún Aonghasa pour la lisibilité
  lat: 53.114,
  lon: -9.738,
  rotationDeg: 0, // +Z vers l'océan
  requires: 'boat',
  description: 'Poll na bPéist, « le trou du ver » : un bassin rectangulaire creusé par la mer dans le calcaire d’Inis Mór, au bord des falaises des îles d’Aran.',
  funFact: 'Ses bords sont si droits qu’on le croirait taillé par l’homme, mais il est entièrement naturel. Le Red Bull Cliff Diving y a installé un plongeoir à près de 28 m de haut.',
  status: 'done',
  photo: { focus: [0, 0.3, PZ], radius: 6, minDistance: 5, maxDistance: 120, bestHours: [18.5, 21] },
  clearRadius: 16,
  colliders: [{ kind: 'box', x: 0, z: PZ, hw: PW / 2 + 0.3, hd: PD / 2 + 0.3, rot: 0 }],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    const g0 = ctx.groundAt(0, PZ);
    // Dallage calcaire (dalles séparées par des fissures, comme le Burren) autour du bassin
    for (let ix = -7; ix <= 7; ix++)
      for (let iz = -3; iz <= 4; iz++) {
        const x = ix * 1.9;
        const z = PZ + iz * 1.9;
        if (Math.abs(x) < PW / 2 + 0.6 && Math.abs(z - PZ) < PD / 2 + 0.6) continue; // le trou
        const y = ctx.groundAt(x, z);
        if (y < ctx.waterY + 0.5) continue; // pas de dalles dans la mer
        b.box(1.7, 0.45, 1.7, (ix + iz) % 3 ? 'limestone' : 'stoneLight', { x, z, y: y - 0.3 + ctx.rng() * 0.08 });
      }
    // Parois du bassin (verticales, bien droites) jusqu'au niveau de l'eau
    const bottom = ctx.waterY - 2;
    const wallH = g0 - bottom + 0.1;
    b.box(PW + 1.2, wallH, 0.6, 'stoneDark', { z: PZ - PD / 2 - 0.3, y: bottom });
    b.box(PW + 1.2, wallH, 0.6, 'stoneDark', { z: PZ + PD / 2 + 0.3, y: bottom });
    for (const s of [-1, 1]) b.box(0.6, wallH, PD, 'stoneDark', { x: s * (PW / 2 + 0.3), z: PZ, y: bottom });
    // Petits repères rouges peints sur les rochers (le vrai sentier en a)
    for (const [x, z] of [
      [-9, -4],
      [-12, 0],
      [9, -5],
    ])
      b.box(0.3, 0.06, 0.3, 'facadeA', { x, z, y: ctx.groundAt(x, z) + 0.17 });
    // Falaise côté mer (dalles stratifiées)
    cliffFace(b, ctx, { xFrom: -16, xTo: 16, step: 3, maxSearch: 30 });
    // Fond sombre du bassin, posé juste au-dessus du sol (le relief n'est pas creusé)
    b.box(PW, 0.04, PD, 'waterDeep', { z: PZ, y: g0 + 0.01 });
    root.add(b.mesh());
    // Surface de l'eau (matériau eau partagé, transparent) au-dessus du fond sombre
    const w = new ModelBuilder();
    w.box(PW, 0.04, PD, 'white', { z: PZ, y: g0 + 0.07 });
    const water = new THREE.Mesh(w.build(), sharedMaterials().water);
    water.renderOrder = 2;
    root.add(water);
    return root;
  },
};
