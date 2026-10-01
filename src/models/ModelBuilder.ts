/**
 * ModelBuilder — LE kit de construction de tous les modèles 3D du jeu.
 *
 * Principe : on empile des formes simples colorées (boîtes, cylindres, cônes,
 * toits…), puis build() les fusionne en UNE seule géométrie (1 draw call).
 * C'est rapide sur iPad et ça donne naturellement le style low-poly.
 *
 * Conventions :
 *   - Les formes sont posées par leur BASE : y = hauteur du bas de la forme
 *     (sauf sphere/ico : y = centre).
 *   - Les couleurs sont des noms de la PALETTE (palette.ts).
 *   - push()/pop() permettent de construire un sous-ensemble décalé/tourné
 *     (ex : une tour entière à x=10, tournée de 30°).
 *
 * Exemple :
 *   const b = new ModelBuilder();
 *   b.box(4, 3, 4, 'whitewash');                 // murs
 *   b.roof(4.4, 1.6, 4.4, 'thatch', { y: 3 });   // toit de chaume
 *   b.box(0.8, 1.6, 0.1, 'door', { z: 2.01 });   // porte
 *   const mesh = b.mesh();
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PALETTE, PaletteName } from './palette';
import { sharedMaterials } from './materials';

export interface Place {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
}

export type ColorRef = PaletteName | number;

const tmpColor = new THREE.Color();
const tmpScale = new THREE.Matrix4();
/** Cache des primitives unitaires (partagé par tous les ModelBuilder). */
const TEMPLATES = new Map<string, THREE.BufferGeometry>();

export class ModelBuilder {
  private parts: THREE.BufferGeometry[] = [];
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];

  /** Démarre un sous-ensemble décalé/tourné. Toujours appeler pop() après. */
  push(p: Place) {
    const m = this.stack[this.stack.length - 1].clone().multiply(placeMatrix(p));
    this.stack.push(m);
    return this;
  }
  pop() {
    if (this.stack.length > 1) this.stack.pop();
    return this;
  }

  /** Ajoute une géométrie quelconque (déjà centrée comme souhaité). */
  add(geo: THREE.BufferGeometry, color: ColorRef, p: Place = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute('uv');
    g.deleteAttribute('normal');
    return this.push2(g, color, placeMatrix(p));
  }

  /** Interne : ajoute une géométrie non indexée avec une matrice locale. */
  private push2(g: THREE.BufferGeometry, color: ColorRef, local: THREE.Matrix4) {
    const m = this.stack[this.stack.length - 1].clone().multiply(local);
    g.applyMatrix4(m);
    const c = tmpColor.set(typeof color === 'number' ? color : PALETTE[color]);
    const n = g.getAttribute('position').count;
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    this.parts.push(g);
    return this;
  }

  /**
   * Interne : primitive "unitaire" mise en cache puis clonée et mise à l'échelle.
   * Beaucoup plus rapide que de recréer une géométrie three.js à chaque appel.
   */
  private prim(key: string, make: () => THREE.BufferGeometry, sx: number, sy: number, sz: number, color: ColorRef, p: Place) {
    let tpl = TEMPLATES.get(key);
    if (!tpl) {
      const g0 = make();
      tpl = g0.index ? g0.toNonIndexed() : g0;
      tpl.deleteAttribute('uv');
      tpl.deleteAttribute('normal');
      TEMPLATES.set(key, tpl);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', (tpl.getAttribute('position') as THREE.BufferAttribute).clone());
    return this.push2(g, color, placeMatrix(p).multiply(tmpScale.makeScale(sx, sy, sz)));
  }

  /** Boîte posée sur sa base. */
  box(w: number, h: number, d: number, color: ColorRef, p: Place = {}) {
    return this.prim('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), w, h, d, color, p);
  }

  /** Cylindre posé sur sa base (segments bas = look low-poly). */
  cylinder(rTop: number, rBottom: number, h: number, color: ColorRef, p: Place = {}, segments = 8) {
    const R = Math.max(rTop, rBottom) || 1;
    const a = +(rTop / R).toFixed(3);
    const c = +(rBottom / R).toFixed(3);
    return this.prim(`cyl:${a}:${c}:${segments}`, () => new THREE.CylinderGeometry(a, c, 1, segments).translate(0, 0.5, 0), R, h, R, color, p);
  }

  /** Cône posé sur sa base. */
  cone(r: number, h: number, color: ColorRef, p: Place = {}, segments = 8) {
    return this.prim(`cone:${segments}`, () => new THREE.ConeGeometry(1, 1, segments).translate(0, 0.5, 0), r, h, r, color, p);
  }

  /** Sphère low-poly centrée en (x,y,z). detail 0 = très facetté, 1 = plus rond. */
  sphere(r: number, color: ColorRef, p: Place = {}, detail = 1) {
    return this.prim(`ico:${detail}`, () => new THREE.IcosahedronGeometry(1, detail), r, r, r, color, p);
  }

  /** Colonne hexagonale (basalte de la Chaussée des Géants…). */
  hexColumn(r: number, h: number, color: ColorRef, p: Place = {}) {
    return this.cylinder(r, r, h, color, p, 6);
  }

  /** Toit à deux pans : prisme triangulaire, faîtage le long de X, posé sur sa base. */
  roof(w: number, h: number, d: number, color: ColorRef, p: Place = {}) {
    const make = () => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, 0);
      shape.lineTo(0.5, 0);
      shape.lineTo(0, 1);
      shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
      g.translate(0, 0, -0.5);
      g.rotateY(Math.PI / 2);
      return g;
    };
    return this.prim('roof', make, w, h, d, color, p);
  }

  /** Arche (mur percé d'une ouverture en plein cintre), épaisseur le long de Z. */
  arch(w: number, h: number, thickness: number, openingW: number, openingH: number, color: ColorRef, p: Place = {}) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(-openingW / 2, 0);
    const r = openingW / 2;
    s.lineTo(-openingW / 2, openingH - r);
    s.absarc(0, openingH - r, r, Math.PI, 0, true);
    s.lineTo(openingW / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h);
    s.lineTo(-w / 2, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, -thickness / 2);
    return this.add(g, color, p);
  }

  /** Créneaux sur le pourtour d'un rectangle (haut de tour/château). */
  crenellations(w: number, d: number, color: ColorRef, p: Place = {}, size = 0.5) {
    const step = size * 2;
    for (let x = -w / 2 + size / 2; x <= w / 2; x += step) {
      this.box(size, size, size, color, { ...p, x: (p.x ?? 0) + x, z: (p.z ?? 0) - d / 2 + size / 2 });
      this.box(size, size, size, color, { ...p, x: (p.x ?? 0) + x, z: (p.z ?? 0) + d / 2 - size / 2 });
    }
    for (let z = -d / 2 + size * 1.5; z <= d / 2 - size; z += step) {
      this.box(size, size, size, color, { ...p, z: (p.z ?? 0) + z, x: (p.x ?? 0) - w / 2 + size / 2 });
      this.box(size, size, size, color, { ...p, z: (p.z ?? 0) + z, x: (p.x ?? 0) + w / 2 - size / 2 });
    }
    return this;
  }

  get isEmpty() {
    return this.parts.length === 0;
  }

  /** Fusionne tout en une seule géométrie. */
  build(): THREE.BufferGeometry {
    if (this.parts.length === 0) return new THREE.BufferGeometry();
    const merged = mergeGeometries(this.parts, false)!;
    merged.computeVertexNormals();
    merged.computeBoundingSphere();
    merged.computeBoundingBox();
    this.parts = [];
    return merged;
  }

  /** Raccourci : géométrie fusionnée + matériau partagé "monde" (ombres activées). */
  mesh(material: THREE.Material = sharedMaterials().world): THREE.Mesh {
    const m = new THREE.Mesh(this.build(), material);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
}

export function placeMatrix(p: Place) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0, 'YXZ'));
  m.compose(new THREE.Vector3(p.x ?? 0, p.y ?? 0, p.z ?? 0), q, new THREE.Vector3(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1));
  return m;
}
