/**
 * Église et puits sacré de Cranfield (Antrim) — ruines d'une petite église
 * médiévale et puits de saint Olcan, sur la rive nord de Lough Neagh (côté +Z).
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { ruinedChurch, drystoneWall } from '../../models/landmarkKit';
import { sharedMaterials } from '../../models/materials';
import { smallTree } from '../../models/sceneryKit';

export const cranfieldChurch: LandmarkDef = {
  id: 'cranfield_church',
  name: 'Église et puits sacré de Cranfield',
  county: 'Antrim',
  province: 'Ulster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Churchtown Point ; légèrement ajusté pour tomber sur la rive du jeu
  lat: 54.709,
  lon: -6.3713,
  rotationDeg: 30, // +Z vers Lough Neagh
  description: 'Les ruines d’une église du XIIIe siècle et un puits sacré, au bord de Lough Neagh, le plus grand lac des îles Britanniques.',
  funFact: 'On dit que le puits de saint Olcan produit de petits cristaux ambrés, censés protéger de la noyade et des malheurs.',
  status: 'done',
  photo: { focus: [0, 2.2, 0], radius: 5, minDistance: 6, maxDistance: 140, bestHours: [19, 21] },
  clearRadius: 14,
  terrain: [{ kind: 'flatten', radius: 4, blend: 2 }], // petit : le lac est à 7 u
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 4.6, hd: 2.6, rot: 0 },
    { kind: 'circle', x: 5.5, z: 4, r: 1.3 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const b = new ModelBuilder();
    // Église en ruine (brique du kit), lierre et pierres tombales
    ruinedChurch(b, { length: 8.5, width: 4.4, height: 3.6, color: 'stone' });
    for (let i = 0; i < 6; i++) b.sphere(0.6, 'leafDark', { x: -4 + i * 1.6, y: 2.4 + (i % 2) * 0.6, z: -2.3, sz: 0.4 }, 0);
    for (let i = 0; i < 8; i++) b.box(0.5, 0.7 + (i % 3) * 0.2, 0.12, 'stoneDark', { x: -5 + (i % 4) * 1.4, z: -5 - Math.floor(i / 4) * 1.4, rz: (i % 2 ? 1 : -1) * 0.08 });
    // Puits sacré : margelle ronde, croix, buisson à rubans (ex-voto)
    b.cylinder(1.1, 1.2, 0.7, 'stoneLight', { x: 5.5, z: 4 }, 10);
    b.box(0.15, 1.1, 0.15, 'stoneDark', { x: 5.5, y: 0.7, z: 2.7 });
    b.box(0.6, 0.15, 0.15, 'stoneDark', { x: 5.5, y: 1.5, z: 2.7 });
    smallTree(b, { x: 7.5, z: 2.5, s: 0.8 });
    for (let i = 0; i < 7; i++) b.box(0.08, 0.5, 0.04, (['facadeA', 'facadeC', 'white', 'facadeB'] as const)[i % 4], { x: 7 + (i % 3) * 0.4, y: 1.6 + (i % 2) * 0.4, z: 2.1 + (i % 4) * 0.3 });
    // Muret de l'enclos
    drystoneWall(b, ctx, -7, -7.5, 8, -7.5);
    drystoneWall(b, ctx, -7, -7.5, -7, 3);
    root.add(b.mesh());
    // Eau du puits
    const w = new ModelBuilder();
    w.cylinder(0.85, 0.85, 0.1, 'white', { x: 5.5, z: 4, y: 0.55 }, 10);
    root.add(new THREE.Mesh(w.build(), sharedMaterials().water));
    return root;
  },
};
