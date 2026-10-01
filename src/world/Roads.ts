/**
 * Routes : un ruban d'asphalte + des tirets blancs au centre, qui suivent le
 * profil lissé calculé par Heightfield. Toutes les routes = 1 seul mesh.
 */
import * as THREE from 'three';
import { WorldGrid } from './WorldGrid';
import { TERRAIN } from '../config/gameConfig';
import { PALETTE } from '../models/palette';
import { sharedMaterials } from '../models/materials';

const LIFT = 0.12; // hauteur du ruban au-dessus du profil
const DASH_EVERY = 3; // un tiret tous les N échantillons (≈ 7.5 u)

export function buildRoadMesh(grid: WorldGrid): THREE.Mesh {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const asphalt = new THREE.Color(PALETTE.road);
  const line = new THREE.Color(PALETTE.roadLine);
  const half = TERRAIN.ROAD_WIDTH / 2;

  const quad = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, px: number, pz: number, w: number, c: THREE.Color, lift: number) => {
    const v = pos.length / 3;
    pos.push(ax - px * w, ay + lift, az - pz * w, ax + px * w, ay + lift, az + pz * w, bx - px * w, by + lift, bz - pz * w, bx + px * w, by + lift, bz + pz * w);
    for (let k = 0; k < 4; k++) col.push(c.r, c.g, c.b);
    idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
  };

  for (const r of grid.routeRanges) {
    const s = grid.roadSamples;
    let prevL = -1;
    for (let n = r.start; n < r.end; n++) {
      const p = s[n];
      const a = s[Math.max(r.start, n - 1)];
      const b = s[Math.min(r.end - 1, n + 1)];
      let dx = b.x - a.x;
      let dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      // vecteur perpendiculaire (vers la droite de la marche)
      const px = -dz;
      const pz = dx;
      const v = pos.length / 3;
      pos.push(p.x - px * half, p.h + LIFT, p.z - pz * half, p.x + px * half, p.h + LIFT, p.z + pz * half);
      col.push(asphalt.r, asphalt.g, asphalt.b, asphalt.r, asphalt.g, asphalt.b);
      if (prevL >= 0) idx.push(prevL, prevL + 1, v, prevL + 1, v + 1, v);
      prevL = v;
      // Tiret central (géométrie séparée pour garder une couleur nette)
      if ((n - r.start) % DASH_EVERY === 0 && n + 1 < r.end) {
        const q = s[n + 1];
        quad(p.x, p.h, p.z, q.x, q.h, q.z, px, pz, 0.14, line, LIFT + 0.03);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, sharedMaterials().road);
  mesh.receiveShadow = true;
  mesh.name = 'roads';
  return mesh;
}
