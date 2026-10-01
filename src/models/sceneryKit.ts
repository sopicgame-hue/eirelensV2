/**
 * KIT "PAYSAGES" : cascades, lacs décoratifs, belvédères, cairns, bateaux,
 * dauphin, arbres. Complète landmarkKit.ts (bâtiments irlandais).
 *
 * Deux sortes de briques :
 *   - celles qui ajoutent des formes dans un ModelBuilder (comme landmarkKit) ;
 *   - celles qui ont besoin d'un MATÉRIAU à part (eau transparente, écume animée) :
 *     elles reçoivent aussi le groupe `root` du monument et y ajoutent leurs meshes.
 * Les cascades sont animées : appelle animateScenery(obj, dt, t) dans le `animate`
 * du monument (voir torc_waterfall.ts).
 */
import * as THREE from 'three';
import { ModelBuilder, ColorRef } from './ModelBuilder';
import { sharedMaterials } from './materials';
import type { BuildContext } from '../content/landmarks/types';

// Objets réutilisés par les animations (aucune allocation à chaque frame)
const dummy = new THREE.Object3D();

// ============================================================== CASCADE
export interface WaterfallOpts {
  x?: number;
  z?: number;
  /** Rotation (rad) : la chute "regarde" vers +Z local par défaut. */
  ry?: number;
  /** Hauteur totale de la chute (u). */
  height: number;
  /** Largeur de la nappe d'eau (u). */
  width: number;
  /** Nombre de marches (1 = chute droite). */
  steps?: number;
  /** Rayon du bassin au pied. */
  poolRadius?: number;
  /** Nombre de flocons d'écume animés. */
  foam?: number;
}

interface WaterfallAnim {
  foam: THREE.InstancedMesh;
  mist: THREE.Mesh[];
  height: number;
  width: number;
  steps: number;
  seeds: Float32Array;
}

/**
 * Cascade en escalier dans une paroi rocheuse, avec bassin, ruisseau et écume animée.
 * Repère : paroi derrière (z < 0), eau qui tombe vers +Z, bassin devant.
 * Sol attendu : plat (ajoute un tampon 'flatten' dans `terrain`).
 */
export function waterfall(root: THREE.Object3D, b: ModelBuilder, ctx: BuildContext, o: WaterfallOpts) {
  const { x = 0, z = 0, ry = 0, height: H, width: W, steps: S = 3, poolRadius = W * 0.8 + 2.5, foam = 40 } = o;
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = ry;
  root.add(group);
  const rock = new ModelBuilder();
  const water = new ModelBuilder();
  const stepH = H / S;
  const faceZ = (k: number) => -k * 0.9; // chaque marche recule un peu

  // Paroi rocheuse en marches + mousse sur les replats
  for (let k = 0; k < S; k++) {
    const fz = faceZ(k);
    const colors: ColorRef[] = ['rockDark', 'rock', 'stoneDark'];
    rock.box(W + 9 - k * 0.8, stepH + 0.25, 7, colors[k % 3], { y: k * stepH, z: fz - 3.5 });
    rock.box(W + 8.5 - k * 0.8, 0.25, 0.9, 'moss', { y: (k + 1) * stepH, z: fz - 0.6 });
    // Rochers d'encadrement de part et d'autre
    for (const s of [-1, 1]) rock.sphere(1.6 + ctx.rng() * 1.2, k % 2 ? 'rock' : 'rockDark', { x: s * (W / 2 + 2 + ctx.rng()), y: k * stepH + stepH * 0.5, z: fz + 0.3, sy: 1.3 }, 0);
  }
  // Plateau herbeux au-dessus, ruisseau d'arrivée
  rock.box(W + 12, 0.6, 10, 'grassDark', { y: H - 0.3, z: faceZ(S - 1) - 6.5 });
  water.box(W * 0.7, 0.15, 10, 'white', { y: H + 0.05, z: faceZ(S - 1) - 5.5 });
  // Arbres au sommet et sur les côtés
  for (let i = 0; i < 6; i++) {
    const tx = (ctx.rng() - 0.5) * (W + 14);
    smallTree(rock, { x: tx, z: faceZ(S - 1) - 4 - ctx.rng() * 6, y: H, s: 0.9 + ctx.rng() * 0.6, kind: i % 2 ? 'pine' : 'round' });
  }
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) smallTree(rock, { x: s * (W / 2 + 6 + i * 2.5), z: 2 + i * 2 - ctx.rng() * 3, y: 0, s: 1 + ctx.rng() * 0.5, kind: 'round' });

  // Nappes d'eau (une par marche) + liserés d'écume
  for (let k = 0; k < S; k++) {
    const fz = faceZ(k);
    const w = W * (1 - k * 0.12);
    water.box(w, stepH + 0.35, 0.3, 'white', { y: k * stepH - 0.1, z: fz + 0.2 });
    rock.box(w + 0.3, 0.3, 0.6, 'white', { y: (k + 1) * stepH - 0.15, z: fz + 0.1 });
    rock.box(w + 1.2, 0.35, 1.2, 'white', { y: k * stepH, z: fz + 0.6 });
  }
  // Bassin + ruisseau + galets
  water.cylinder(poolRadius, poolRadius, 0.25, 'white', { y: 0.02, z: poolRadius * 0.75 }, 16);
  water.box(2.4, 0.2, 14, 'white', { y: 0.02, z: poolRadius * 1.6 + 6 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rock.sphere(0.5 + ctx.rng() * 0.6, i % 3 ? 'rock' : 'stoneLight', { x: Math.cos(a) * poolRadius, y: 0.1, z: poolRadius * 0.75 + Math.sin(a) * poolRadius, sy: 0.6 }, 0);
  }
  group.add(rock.mesh(), waterMesh(water));

  // Écume animée + brume
  const foamMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.32, 0), sharedMaterials().foam, foam);
  foamMesh.frustumCulled = false;
  group.add(foamMesh);
  const mist: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), sharedMaterials().foam);
    m.position.set((i - 1) * W * 0.3, 0.6, 1.2);
    group.add(m);
    mist.push(m);
  }
  const seeds = new Float32Array(foam * 2);
  for (let i = 0; i < seeds.length; i++) seeds[i] = ctx.rng();
  const anim: WaterfallAnim = { foam: foamMesh, mist, height: H, width: W, steps: S, seeds };
  const list = (root.userData.waterfalls ??= []) as WaterfallAnim[];
  list.push(anim);
}

function animateWaterfall(a: WaterfallAnim, t: number) {
  const n = a.foam.count;
  const stepH = a.height / a.steps;
  for (let i = 0; i < n; i++) {
    const phase = (t * 0.45 + a.seeds[i * 2]) % 1; // 0 = en haut, 1 = dans le bassin
    const y = a.height * (1 - phase);
    const k = Math.min(a.steps - 1, Math.floor(y / stepH));
    const w = a.width * (1 - k * 0.12);
    const splash = phase > 0.92 ? (phase - 0.92) * 12 : 0;
    dummy.position.set((a.seeds[i * 2 + 1] - 0.5) * w, y + splash * 0.5, -k * 0.9 + 0.5 + splash);
    dummy.scale.setScalar(0.7 + splash * 0.6 + Math.sin(t * 6 + i) * 0.15);
    dummy.updateMatrix();
    a.foam.setMatrixAt(i, dummy.matrix);
  }
  a.foam.instanceMatrix.needsUpdate = true;
  a.mist.forEach((m, i) => m.scale.setScalar(1 + Math.sin(t * 1.3 + i * 2) * 0.25));
}

/** À appeler dans le `animate` d'un monument qui utilise waterfall() et/ou dolphin(). */
export function animateScenery(obj: THREE.Object3D, _dt: number, t: number) {
  const wfs = obj.userData.waterfalls as WaterfallAnim[] | undefined;
  if (wfs) for (const a of wfs) animateWaterfall(a, t);
  const d = obj.userData.dolphin as DolphinAnim | undefined;
  if (d) animateDolphin(d, t);
}

// ================================================================ LAC
/**
 * Plan d'eau décoratif (ellipse) posé à la hauteur locale `y`, avec galets et roseaux.
 * Le sol doit être aplani dessous ET un peu plus bas que les rives (tampon 'flatten').
 */
export function lake(root: THREE.Object3D, b: ModelBuilder, ctx: BuildContext, o: { x: number; z: number; rx: number; rz: number; ry?: number; y?: number }) {
  const { x, z, rx, rz, ry = 0, y = 0.08 } = o;
  const w = new ModelBuilder();
  w.cylinder(1, 1, 0.12, 'white', { x, z, y, ry, sx: rx, sz: rz }, 28);
  root.add(waterMesh(w));
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const lx = Math.cos(a) * rx * 1.02;
    const lz = Math.sin(a) * rz * 1.02;
    const px = x + lx * c + lz * s;
    const pz = z - lx * s + lz * c;
    if (i % 3 === 0) b.cone(0.25, 1.1 + ctx.rng() * 0.6, 'grassDark', { x: px, z: pz, y: y - 0.1 }, 4);
    else b.sphere(0.35 + ctx.rng() * 0.3, ctx.rng() > 0.5 ? 'rock' : 'stoneLight', { x: px, z: pz, y: y, sy: 0.5 }, 0);
  }
}

function waterMesh(w: ModelBuilder) {
  const m = new THREE.Mesh(w.build(), sharedMaterials().water);
  m.receiveShadow = true;
  m.renderOrder = 2;
  return m;
}

// ========================================================= BELVÉDÈRE / CAIRN
/** Belvédère : muret de pierre en arc (face à +Z), banc et panneau d'information. */
export function viewpoint(b: ModelBuilder, ctx: BuildContext, o: { x?: number; z?: number; ry?: number; radius?: number }) {
  const { x = 0, z = 0, ry = 0, radius = 5 } = o;
  b.push({ x, z, ry });
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI * 0.4 + (i / 8) * Math.PI * 0.8;
    const px = Math.sin(a) * radius;
    const pz = Math.cos(a) * radius;
    b.box(radius * 0.36, 0.9 + ctx.rng() * 0.1, 0.6, i % 2 ? 'stone' : 'stoneLight', { x: px, z: pz, y: ctx.groundAt(x + px, z + pz) - ctx.groundAt(x, z) - 0.1, ry: a });
  }
  // Banc (face au paysage)
  b.box(2.2, 0.12, 0.55, 'wood', { z: radius - 2.2, y: 0.55 });
  b.box(2.2, 0.55, 0.1, 'wood', { z: radius - 2.55, y: 0.65, rx: -0.15 });
  for (const s of [-1, 1]) b.box(0.12, 0.55, 0.5, 'woodDark', { x: s * 0.95, z: radius - 2.2 });
  // Panneau d'information incliné
  for (const s of [-1, 1]) b.box(0.15, 1.2, 0.15, 'woodDark', { x: radius * 0.55 + s * 0.6, z: radius - 1.5 });
  b.box(1.6, 0.9, 0.08, 'woodDark', { x: radius * 0.55, y: 1.0, z: radius - 1.5, rx: -0.5 });
  b.box(1.4, 0.7, 0.04, 'whitewash', { x: radius * 0.55, y: 1.08, z: radius - 1.43, rx: -0.5 });
  b.pop();
}

/** Cairn préhistorique : tas de pierres arrondi. */
export function cairn(b: ModelBuilder, ctx: BuildContext, o: { x?: number; z?: number; radius?: number; height?: number }) {
  const { x = 0, z = 0, radius = 3, height = 2 } = o;
  const y0 = ctx.groundAt(x, z);
  b.sphere(radius, 'stone', { x, z, y: y0 - radius * 0.35, sy: height / radius }, 1);
  for (let i = 0; i < 14; i++) {
    const a = ctx.rng() * Math.PI * 2;
    const r = Math.sqrt(ctx.rng()) * radius * 0.85;
    const px = x + Math.cos(a) * r;
    const pz = z + Math.sin(a) * r;
    const hy = y0 - radius * 0.35 + Math.sqrt(Math.max(0, 1 - (r / radius) ** 2)) * height;
    b.sphere(0.35 + ctx.rng() * 0.35, ctx.rng() > 0.5 ? 'stoneLight' : 'stoneDark', { x: px, z: pz, y: hy - 0.1 }, 0);
  }
}

// ================================================================ BATEAUX
/** Barque (avant vers +Z). */
export function rowingBoat(b: ModelBuilder, o: { x?: number; z?: number; y?: number; ry?: number; color?: ColorRef }) {
  const { x = 0, z = 0, y = 0, ry = 0, color = 'facadeB' } = o;
  b.push({ x, y, z, ry });
  b.box(1.3, 0.5, 3.2, color, { y: 0 });
  b.box(0.8, 0.5, 0.7, color, { y: 0.02, z: 1.8 });
  b.box(1.1, 0.1, 2.9, 'wood', { y: 0.32 });
  b.box(1.2, 0.08, 0.3, 'woodDark', { y: 0.36, z: 0.3 });
  b.pop();
}

/** "Galway hooker" : voilier traditionnel noir aux voiles rouge-brun (avant vers +Z). */
export function hookerBoat(b: ModelBuilder, o: { x?: number; z?: number; y?: number; ry?: number }) {
  const { x = 0, z = 0, y = 0, ry = 0 } = o;
  b.push({ x, y, z, ry });
  b.box(2.2, 1.2, 6.5, 'boatHull', { y: -0.4 });
  b.box(1.4, 1.1, 1.6, 'boatHull', { y: -0.3, z: 3.8, rx: -0.25 });
  b.box(2.0, 0.12, 6.0, 'wood', { y: 0.78 });
  b.cylinder(0.12, 0.15, 8, 'woodDark', { y: 0.8, z: 0.8 }, 6); // mât
  b.box(0.08, 6, 3.8, 'sailRed', { y: 1.8, z: -1.1, rx: 0.08 }); // grand-voile
  b.box(0.08, 4.2, 2.2, 'sailRed', { y: 2.3, z: 2.6, rx: -0.35 }); // foc
  b.pop();
}

// ================================================================ DAUPHIN
interface DolphinAnim {
  mesh: THREE.Object3D;
  x: number;
  z: number;
  waterY: number;
  dirX: number;
  dirZ: number;
}

/** Dauphin (géométrie seule, avant vers +Z). */
function dolphinMesh() {
  const b = new ModelBuilder();
  b.sphere(0.55, 'dolphin', { sx: 0.8, sy: 0.75, sz: 2.4 }, 1);
  b.sphere(0.45, 'dolphinBelly', { y: -0.12, sx: 0.7, sy: 0.55, sz: 2.0 }, 1);
  b.cone(0.18, 0.6, 'dolphin', { y: 0.15, z: 1.25, rx: Math.PI / 2 }, 6); // rostre
  b.cone(0.35, 0.7, 'dolphin', { y: 0.3, z: -0.1, rx: -0.5, sz: 0.25 }, 4); // aileron
  b.box(1.3, 0.08, 0.45, 'dolphin', { z: -1.45 }); // nageoire caudale
  for (const s of [-1, 1]) b.box(0.6, 0.06, 0.25, 'dolphin', { x: s * 0.45, y: -0.2, z: 0.5, rz: s * -0.5 });
  return b.mesh();
}

/**
 * Dauphin qui saute régulièrement hors de l'eau en (x, z), dans la direction (dirX, dirZ).
 * Nécessite de l'eau à cet endroit (ctx.waterY) ; animé par animateScenery().
 */
export function dolphin(root: THREE.Object3D, ctx: BuildContext, o: { x: number; z: number; dirX?: number; dirZ?: number }) {
  const mesh = dolphinMesh();
  root.add(mesh);
  const anim: DolphinAnim = { mesh, x: o.x, z: o.z, waterY: ctx.waterY, dirX: o.dirX ?? 1, dirZ: o.dirZ ?? 0 };
  root.userData.dolphin = anim;
}

function animateDolphin(d: DolphinAnim, t: number) {
  const period = 7;
  const p = (t % period) / 1.6; // saut de 1,6 s toutes les 7 s
  const m = d.mesh;
  if (p > 1) {
    m.visible = false;
    return;
  }
  m.visible = true;
  const along = (p - 0.5) * 7;
  m.position.set(d.x + d.dirX * along, d.waterY - 0.6 + Math.sin(p * Math.PI) * 3.2, d.z + d.dirZ * along);
  m.rotation.set(-Math.cos(p * Math.PI) * 0.9, Math.atan2(d.dirX, d.dirZ), 0, 'YXZ');
}

// ================================================================ ARBRES
/** Petit arbre (rond = feuillu, pine = conifère), échelle s. */
export function smallTree(b: ModelBuilder, o: { x: number; z: number; y?: number; s?: number; kind?: 'round' | 'pine' }) {
  const { x, z, y = 0, s = 1, kind = 'round' } = o;
  b.cylinder(0.18 * s, 0.25 * s, 1.6 * s, 'trunk', { x, z, y }, 5);
  if (kind === 'pine') {
    b.cone(1.3 * s, 2.4 * s, 'leafDark', { x, z, y: y + 1.2 * s }, 6);
    b.cone(0.95 * s, 2 * s, 'leaf', { x, z, y: y + 2.4 * s }, 6);
  } else {
    b.sphere(1.3 * s, 'leaf', { x, z, y: y + 2.4 * s }, 0);
    b.sphere(0.9 * s, 'leafLight', { x: x + 0.5 * s, z, y: y + 3.0 * s }, 0);
  }
}

// ================================================================ POUTRES
/** Cylindre tendu entre deux points (câbles, haubans, mâts penchés, poutres). */
export function beam(b: ModelBuilder, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, r: number, color: ColorRef, segments = 5) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-4) return;
  // Le cylindre est vertical (+Y) : on l'incline de rx autour de X, puis on l'oriente de ry autour de Y
  b.cylinder(r, r, len, color, { x: x1, y: y1, z: z1, rx: Math.acos(Math.max(-1, Math.min(1, dy / len))), ry: Math.atan2(dx, dz) }, segments);
}

// ================================================================ CYGNE
/** Cygne posé sur l'eau (avant vers +Z). */
export function swan(b: ModelBuilder, o: { x: number; z: number; y: number; ry?: number }) {
  const { x, z, y, ry = 0 } = o;
  b.push({ x, y, z, ry });
  b.sphere(0.45, 'white', { y: 0.2, sx: 0.8, sy: 0.6, sz: 1.3 }, 1);
  b.cylinder(0.08, 0.1, 0.9, 'white', { y: 0.35, z: 0.35, rx: 0.25 }, 5);
  b.sphere(0.13, 'white', { y: 1.2, z: 0.6 }, 0);
  b.cone(0.06, 0.22, 'facadeF', { y: 1.18, z: 0.72, rx: Math.PI / 2 }, 4);
  b.pop();
}
