/**
 * Scatter — végétation et rochers semés automatiquement sur chaque chunk.
 * Déterministe : le même chunk produit toujours les mêmes arbres.
 *
 * Pour ajouter un type d'objet semé :
 *   1. ajoute sa géométrie dans models/nature.ts
 *   2. ajoute une règle dans RULES (où il pousse, densité, collision)
 */
import * as THREE from 'three';
import { Heightfield } from './Heightfield';
import { Colliders } from './Colliders';
import { Chunk, TerrainChunks } from './TerrainChunks';
import { natureGeometries } from '../models/nature';
import { sharedMaterials } from '../models/materials';
import { makeRng, fbm, hash2 } from '../core/math';
import { WORLD } from '../config/gameConfig';

interface Spot {
  x: number;
  z: number;
  h: number;
  slope: number;
  wood: number;
  mountain: number;
  r: number;
}

interface Rule {
  geo: 'treeRound' | 'treePine' | 'bush' | 'rock';
  /** Probabilité d'apparition en ce point (0-1). */
  chance: (s: Spot) => number;
  scale: [number, number];
  /** Rayon de collision à l'échelle 1 (0 = traversable). */
  collide: number;
}

const RULES: Rule[] = [
  { geo: 'treeRound', scale: [0.8, 1.4], collide: 0.45, chance: (s) => (s.slope < 0.6 && s.h > 1.8 ? s.wood * 0.55 + 0.035 : 0) * (1 - s.mountain) },
  { geo: 'treePine', scale: [0.9, 1.5], collide: 0.4, chance: (s) => (s.slope < 0.7 && s.h > 3 && s.wood > 0.4 ? 0.25 * s.mountain + 0.1 : 0) },
  { geo: 'bush', scale: [0.7, 1.3], collide: 0, chance: (s) => (s.slope < 0.9 && s.h > 1.4 ? 0.07 + 0.1 * s.mountain : 0) },
  { geo: 'rock', scale: [0.5, 2.0], collide: 0.85, chance: (s) => (s.h > 1 ? 0.02 + 0.3 * s.mountain * s.slope : 0) },
];

const CELL = 9; // pas de la grille de semis (unités)

export class Scatter {
  readonly group = new THREE.Group();
  private perChunk = new Map<string, THREE.InstancedMesh[]>();

  constructor(
    private hf: Heightfield,
    private colliders: Colliders,
    terrain: TerrainChunks,
    /** Retourne true si l'emplacement est réservé (ville, monument…). */
    private reserved: (x: number, z: number) => boolean,
  ) {
    this.group.name = 'scatter';
    terrain.onChunkCreated((c) => this.populate(c));
    terrain.onChunkDisposed((c) => this.clear(c));
  }

  private populate(c: Chunk) {
    const g = this.hf.grid;
    const x0 = g.vx(c.i0);
    const z0 = g.vz(c.j0);
    const x1 = g.vx(c.i1);
    const z1 = g.vz(c.j1);
    const rng = makeRng(hash2(c.ci, c.cj, WORLD.SEED) * 1e9);
    const buckets = new Map<Rule['geo'], THREE.Matrix4[]>();
    const owner = `scatter:${c.key}`;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);

    for (let z = z0; z < z1; z += CELL)
      for (let x = x0; x < x1; x += CELL) {
        const px = x + rng() * CELL;
        const pz = z + rng() * CELL;
        const h = this.hf.heightAt(px, pz);
        if (h < 1.2) continue;
        if (this.hf.roadDistanceAt(px, pz) < 8) continue;
        if (this.reserved(px, pz)) continue;
        const spot: Spot = {
          x: px,
          z: pz,
          h,
          slope: this.hf.slopeAt(px, pz),
          wood: Math.max(0, fbm(px / 260, pz / 260, 3, WORLD.SEED + 21) * 2 - 0.15),
          mountain: this.hf.mountainFactor(px, pz),
          r: rng(),
        };
        let acc = 0;
        for (const rule of RULES) {
          acc += rule.chance(spot);
          if (spot.r >= acc) continue;
          const s = rule.scale[0] + rng() * (rule.scale[1] - rule.scale[0]);
          q.setFromAxisAngle(up, rng() * Math.PI * 2);
          m.compose(new THREE.Vector3(px, h - 0.1, pz), q, new THREE.Vector3(s, s, s));
          let list = buckets.get(rule.geo);
          if (!list) buckets.set(rule.geo, (list = []));
          list.push(m.clone());
          if (rule.collide > 0) this.colliders.add(owner, { kind: 'circle', x: px, z: pz, r: rule.collide * s });
          break;
        }
      }

    const geos = natureGeometries();
    const meshes: THREE.InstancedMesh[] = [];
    for (const [geo, mats] of buckets) {
      const im = new THREE.InstancedMesh(geos[geo], sharedMaterials().world, mats.length);
      mats.forEach((mm, i) => im.setMatrixAt(i, mm));
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.castShadow = true;
      im.receiveShadow = true;
      this.group.add(im);
      meshes.push(im);
    }
    this.perChunk.set(c.key, meshes);
  }

  private clear(c: Chunk) {
    for (const im of this.perChunk.get(c.key) ?? []) {
      this.group.remove(im);
      im.dispose();
    }
    this.perChunk.delete(c.key);
    this.colliders.removeOwner(`scatter:${c.key}`);
  }
}
