/**
 * KIT DE CONSTRUCTION DES MONUMENTS IRLANDAIS
 * ---------------------------------------------------------------------------
 * Briques réutilisables typiques de l'Irlande. Avant de modéliser un nouveau
 * monument, regarde si une brique existe ici : la plupart des châteaux
 * irlandais sont des "tower houses", la plupart des sites monastiques ont une
 * tour ronde et une croix celtique, etc.
 *
 * Toutes les fonctions ajoutent des formes dans un ModelBuilder existant
 * (coordonnées locales du monument). Elles ne renvoient rien.
 */
import * as THREE from 'three';
import { ModelBuilder, ColorRef } from './ModelBuilder';
import { sharedMaterials } from './materials';
import type { BuildContext } from '../content/landmarks/types';

/** Tour ronde monastique (Glendalough, Clonmacnoise, Cashel…). */
export function roundTower(b: ModelBuilder, o: { x?: number; z?: number; y?: number; height?: number; radius?: number; color?: ColorRef; capColor?: ColorRef }) {
  const { x = 0, z = 0, y = 0, height = 15, radius = 1.2, color = 'stoneLight', capColor = 'stoneDark' } = o;
  b.cylinder(radius * 0.92, radius * 1.1, height, color, { x, z, y }, 12);
  b.cone(radius * 1.05, height * 0.2, capColor, { x, z, y: y + height }, 12);
  b.box(radius * 0.45, 1.1, 0.3, 'woodDark', { x, z: z + radius, y: y + height * 0.25 }); // porte surélevée
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.box(0.28, 0.55, 0.25, 'window', { x: x + Math.sin(a) * radius * 0.98, z: z + Math.cos(a) * radius * 0.98, y: y + height * 0.9, ry: a });
  }
}

/**
 * Tour-maison ("tower house") : LE château irlandais typique du XVe siècle
 * (Bunratty, Blarney, Ross, Dunguaire…). Bloc haut, créneaux, petites fenêtres.
 */
export function towerHouse(
  b: ModelBuilder,
  o: { x?: number; z?: number; y?: number; ry?: number; width?: number; depth?: number; height?: number; color?: ColorRef; cornerTurrets?: boolean },
) {
  const { x = 0, z = 0, y = 0, ry = 0, width = 7, depth = 6, height = 14, color = 'stone', cornerTurrets = false } = o;
  b.push({ x, y, z, ry });
  b.box(width, height, depth, color);
  b.box(width + 0.3, 0.35, depth + 0.3, 'stoneLight', { y: height - 0.2 });
  b.crenellations(width + 0.3, depth + 0.3, color, { y: height + 0.15 }, 0.55);
  // Fenêtres étroites sur chaque face
  for (let f = 0; f < 4; f++) {
    const along = f % 2 === 0 ? width : depth;
    const off = f % 2 === 0 ? depth / 2 : width / 2;
    for (let level = 1; level <= Math.floor(height / 3.5); level++)
      for (const t of [-0.25, 0.25]) {
        const rot = (f * Math.PI) / 2;
        const lx = Math.sin(rot) * off + Math.cos(rot) * t * along;
        const lz = Math.cos(rot) * off - Math.sin(rot) * t * along;
        b.box(0.35, 0.8, 0.12, 'window', { x: lx, z: lz, y: level * 3.3, ry: rot });
      }
  }
  b.box(1.1, 2, 0.15, 'woodDark', { z: depth / 2 + 0.02 });
  if (cornerTurrets)
    for (const [sx, sz] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ])
      b.box(1.6, height + 2, 1.6, color, { x: (sx * width) / 2, z: (sz * depth) / 2 });
  b.pop();
}

/** Phare : tour effilée + galerie + lanterne. Ajoute une lanterne lumineuse au groupe `root` si fourni. */
export function lighthouse(
  b: ModelBuilder,
  o: { x?: number; z?: number; y?: number; height?: number; radius?: number; color?: ColorRef; bandColor?: ColorRef; bands?: number },
  root?: THREE.Object3D,
) {
  const { x = 0, z = 0, y = 0, height = 12, radius = 1.8, color = 'whitewash', bandColor, bands = 0 } = o;
  b.cylinder(radius * 0.75, radius, height, color, { x, z, y }, 14);
  if (bandColor)
    for (let i = 0; i < bands; i++) {
      const by = y + (height / (bands * 2 + 1)) * (i * 2 + 1);
      const rr = radius - (radius * 0.25 * (by - y)) / height;
      b.cylinder(rr + 0.02, rr + 0.04, height / (bands * 2 + 1), bandColor, { x, z, y: by }, 14);
    }
  b.cylinder(radius * 0.95, radius * 0.95, 0.3, 'black', { x, z, y: y + height }, 14);
  b.cylinder(radius * 0.55, radius * 0.55, 0.2, 'black', { x, z, y: y + height + 0.3 }, 12);
  b.cylinder(radius * 0.58, radius * 0.58, 0.2, 'black', { x, z, y: y + height + 1.8 }, 12);
  b.sphere(radius * 0.58, 'black', { x, z, y: y + height + 2.0, sy: 0.6 }, 1);
  if (root) {
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 1.4, 12), sharedMaterials().glow);
    glass.position.set(x, y + height + 1.1, z);
    root.add(glass);
  }
}

/** Croix celtique (anneau + bras), face vers +Z. */
export function celticCross(b: ModelBuilder, o: { x?: number; z?: number; y?: number; height?: number; ry?: number; color?: ColorRef }) {
  const { x = 0, z = 0, y = 0, height = 3.4, ry = 0, color = 'stone' } = o;
  b.push({ x, y, z, ry });
  b.box(0.9, 0.5, 0.6, color); // socle
  b.box(0.42, height, 0.28, color, { y: 0.5 });
  b.box(height * 0.5, 0.36, 0.28, color, { y: 0.5 + height * 0.68 });
  b.add(new THREE.TorusGeometry(height * 0.16, 0.08, 4, 12), color, { y: 0.5 + height * 0.73 });
  b.pop();
}

/** Église en ruine (murs + pignons, sans toit). Axe long = X. */
export function ruinedChurch(b: ModelBuilder, o: { x?: number; z?: number; y?: number; ry?: number; length?: number; width?: number; height?: number; color?: ColorRef }) {
  const { x = 0, z = 0, y = 0, ry = 0, length = 10, width = 5, height = 4.5, color = 'stone' } = o;
  b.push({ x, y, z, ry });
  b.box(length, height, 0.6, color, { z: -width / 2 });
  b.box(length, height, 0.6, color, { z: width / 2 });
  b.box(0.6, height, width, color, { x: -length / 2 });
  b.box(0.6, height, width, color, { x: length / 2 });
  b.roof(0.6, width * 0.45, width, color, { x: -length / 2, y: height });
  b.roof(0.6, width * 0.45, width, color, { x: length / 2, y: height });
  b.box(0.9, 2.2, 0.7, 'window', { x: length / 2, y: height * 0.35, ry: Math.PI / 2 });
  b.pop();
}

/** Chaumière blanchie à la chaux au toit de chaume (cottage irlandais). Façade vers +Z. */
export function cottage(b: ModelBuilder, o: { x?: number; z?: number; y?: number; ry?: number; length?: number; doorColor?: ColorRef }) {
  const { x = 0, z = 0, y = 0, ry = 0, length = 7, doorColor = 'door' } = o;
  b.push({ x, y, z, ry });
  b.box(length, 2.6, 4, 'whitewash');
  b.roof(length + 0.5, 2.2, 4.8, 'thatch', { y: 2.5 });
  b.box(0.9, 1.8, 0.1, doorColor, { z: 2.02 });
  b.box(0.8, 0.8, 0.1, 'window', { x: -length / 4, y: 1.1, z: 2.02 });
  b.box(0.8, 0.8, 0.1, 'window', { x: length / 4, y: 1.1, z: 2.02 });
  b.box(0.7, 1.3, 0.7, 'whitewash', { x: length / 2 - 0.6, y: 4.2 }); // cheminée
  b.pop();
}

/** Muret de pierres sèches qui suit le sol, de (x1,z1) à (x2,z2). */
export function drystoneWall(b: ModelBuilder, ctx: BuildContext, x1: number, z1: number, x2: number, z2: number, color: ColorRef = 'stone') {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const n = Math.max(1, Math.round(len / 1.6));
  const ry = Math.atan2(x2 - x1, z2 - z1);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x1 + (x2 - x1) * t;
    const z = z1 + (z2 - z1) * t;
    b.box(0.6, 0.9 + ctx.rng() * 0.15, len / n + 0.05, color, { x, z, y: ctx.groundAt(x, z) - 0.15, ry });
  }
}

/**
 * Paroi de falaise stratifiée : plaque des "dalles" verticales de roche en
 * couches sur un bord de falaise du relief (falaises de Moher, Slieve League,
 * Dunluce…). Pour chaque x entre xFrom et xTo, cherche le long de +Z local le
 * point à mi-hauteur de la falaise, puis y pose une dalle tournée vers la mer.
 */
export function cliffFace(b: ModelBuilder, ctx: BuildContext, o: { xFrom: number; xTo: number; step?: number; maxSearch?: number; colors?: ColorRef[] }) {
  const { xFrom, xTo, step = 2.5, maxSearch = 40, colors = ['rockDark', 'rock', 'stoneDark', 'rock', 'peat'] } = o;
  for (let x = xFrom; x <= xTo; x += step) {
    // 1. Sommet local : point le plus haut sur la ligne de recherche
    let top = -Infinity;
    for (let z = -6; z < maxSearch; z += 1) top = Math.max(top, ctx.groundAt(x, z));
    if (top - ctx.waterY < 3) continue; // pas de falaise ici
    // 2. Point à mi-hauteur (en descendant vers la mer)
    const mid = (top + ctx.waterY) / 2;
    let zMid = NaN;
    let passedTop = false;
    for (let z = -6; z < maxSearch; z += 0.5) {
      const g = ctx.groundAt(x, z);
      if (g >= top - 0.5) passedTop = true;
      if (passedTop && g < mid) {
        zMid = z;
        break;
      }
    }
    if (Number.isNaN(zMid)) continue;
    // 3. Orientation : vers la descente (gradient du sol)
    const gx = ctx.groundAt(x + 1, zMid) - ctx.groundAt(x - 1, zMid);
    const gz = ctx.groundAt(x, zMid + 1) - ctx.groundAt(x, zMid - 1);
    const ry = Math.atan2(-gx, -gz);
    // 4. Dalle en couches, du pied (sous l'eau) jusqu'au sommet
    const bottom = ctx.waterY - 1.2;
    const total = top - 0.25 - bottom;
    const layers = Math.max(3, Math.round(total / 1.6));
    const h = total / layers;
    for (let i = 0; i < layers; i++) {
      const out = (ctx.rng() - 0.5) * 0.35;
      b.box(step + 0.7, h + 0.03, 1.4, colors[i % colors.length], { x, z: zMid, y: bottom + i * h, ry, sz: 1 + out });
    }
  }
}
