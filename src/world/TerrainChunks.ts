/**
 * TerrainChunks — découpe le relief en carrés ("chunks") chargés autour du
 * joueur et déchargés quand il s'éloigne. Seuls ~50 chunks existent à la fois.
 *
 * Pour attacher du contenu à un chunk (végétation, rochers…), utilise
 * onChunkCreated / onChunkDisposed : voir Scatter.ts.
 */
import * as THREE from 'three';
import { TERRAIN } from '../config/gameConfig';
import { Heightfield } from './Heightfield';
import { terrainColor } from './TerrainColors';
import { sharedMaterials } from '../models/materials';

export interface Chunk {
  key: string;
  ci: number;
  cj: number;
  mesh: THREE.Mesh;
  /** Bornes en indices de sommets de la grille. */
  i0: number;
  j0: number;
  i1: number;
  j1: number;
}

type ChunkHook = (c: Chunk) => void;

export class TerrainChunks {
  readonly group = new THREE.Group();
  private chunks = new Map<string, Chunk>();
  private createdHooks: ChunkHook[] = [];
  private disposedHooks: ChunkHook[] = [];
  private readonly N = TERRAIN.CHUNK_CELLS;
  /** Rayon de chargement (en chunks) — réduit en qualité "basse". */
  radius = TERRAIN.LOAD_RADIUS;
  private lastCi = NaN;
  private lastCj = NaN;
  private lastRadius = -1;
  private pending = 0;

  constructor(private hf: Heightfield) {
    this.group.name = 'terrain';
  }

  onChunkCreated(cb: ChunkHook) {
    this.createdHooks.push(cb);
  }
  onChunkDisposed(cb: ChunkHook) {
    this.disposedHooks.push(cb);
  }

  get count() {
    return this.chunks.size;
  }

  /** Coordonnées du chunk contenant le point monde (x, z). */
  chunkAt(x: number, z: number) {
    const g = this.hf.grid;
    return {
      ci: Math.floor((x - g.minX) / g.S / this.N),
      cj: Math.floor((z - g.minZ) / g.S / this.N),
    };
  }

  /**
   * Charge/décharge les chunks autour de (x, z).
   * @param budget nombre max de chunks créés cet appel (Infinity au chargement)
   * @returns nombre de chunks encore à créer
   */
  update(x: number, z: number, budget: number = TERRAIN.CHUNKS_PER_FRAME) {
    const { ci, cj } = this.chunkAt(x, z);
    // Rien à faire si on n'a pas changé de chunk et que tout est déjà chargé (cas de 99 % des frames)
    if (ci === this.lastCi && cj === this.lastCj && this.pending === 0 && this.radius === this.lastRadius) return 0;
    this.lastCi = ci;
    this.lastCj = cj;
    this.lastRadius = this.radius;
    const R = this.radius;
    const g = this.hf.grid;
    const maxCi = Math.floor((g.nx - 2) / this.N);
    const maxCj = Math.floor((g.nz - 2) / this.N);
    const wanted: { ci: number; cj: number; d: number }[] = [];
    for (let dj = -R; dj <= R; dj++)
      for (let di = -R; di <= R; di++) {
        const a = ci + di;
        const b = cj + dj;
        if (a < 0 || b < 0 || a > maxCi || b > maxCj) continue;
        if (di * di + dj * dj > (R + 0.5) * (R + 0.5)) continue;
        if (!this.chunks.has(`${a},${b}`)) wanted.push({ ci: a, cj: b, d: di * di + dj * dj });
      }
    wanted.sort((p, q) => p.d - q.d);
    for (let k = 0; k < Math.min(budget, wanted.length); k++) this.create(wanted[k].ci, wanted[k].cj);

    // Déchargement (avec hystérésis d'un chunk)
    for (const c of this.chunks.values()) {
      const di = c.ci - ci;
      const dj = c.cj - cj;
      if (di * di + dj * dj > (R + 1.5) * (R + 1.5)) this.dispose(c);
    }
    this.pending = Math.max(0, wanted.length - budget);
    return this.pending;
  }

  private create(ci: number, cj: number) {
    const N = this.N;
    const g = this.hf.grid;
    const i0 = ci * N;
    const j0 = cj * N;
    const i1 = Math.min(i0 + N, g.nx - 1);
    const j1 = Math.min(j0 + N, g.nz - 1);
    const w = i1 - i0 + 1;
    const d = j1 - j0 + 1;
    const pos = new Float32Array(w * d * 3);
    const col = new Float32Array(w * d * 3);
    const color = new THREE.Color();
    for (let j = 0; j < d; j++)
      for (let i = 0; i < w; i++) {
        const gi = i0 + i;
        const gj = j0 + j;
        const h = this.hf.vertexHeight(gi, gj);
        const k = (j * w + i) * 3;
        pos[k] = g.vx(gi);
        pos[k + 1] = h;
        pos[k + 2] = g.vz(gj);
        // Pente approximée par différences finies sur la grille
        const hx = this.hf.vertexHeight(Math.min(gi + 1, g.nx - 1), gj) - this.hf.vertexHeight(Math.max(gi - 1, 0), gj);
        const hz = this.hf.vertexHeight(gi, Math.min(gj + 1, g.nz - 1)) - this.hf.vertexHeight(gi, Math.max(gj - 1, 0));
        const slope = Math.hypot(hx, hz) / (2 * g.S);
        const info = this.hf.vertexInfo(gi, gj);
        terrainColor(color, pos[k], pos[k + 2], h, slope, info.coast, info.mountain);
        col[k] = color.r;
        col[k + 1] = color.g;
        col[k + 2] = color.b;
      }
    const idx: number[] = [];
    for (let j = 0; j < d - 1; j++)
      for (let i = 0; i < w - 1; i++) {
        const a = j * w + i;
        const b = a + 1;
        const c = a + w;
        const e = c + 1;
        // Même diagonale que Heightfield.heightAt : (b — c)
        idx.push(a, c, b, b, c, e);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, sharedMaterials().terrain);
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.name = `chunk ${ci},${cj}`;
    this.group.add(mesh);
    const chunk: Chunk = { key: `${ci},${cj}`, ci, cj, mesh, i0, j0, i1, j1 };
    this.chunks.set(chunk.key, chunk);
    this.createdHooks.forEach((h) => h(chunk));
  }

  private dispose(c: Chunk) {
    this.disposedHooks.forEach((h) => h(c));
    this.group.remove(c.mesh);
    c.mesh.geometry.dispose();
    this.chunks.delete(c.key);
  }

  disposeAll() {
    for (const c of [...this.chunks.values()]) this.dispose(c);
    this.lastCi = NaN;
  }
}
