/**
 * Villes : petites maisons aux façades colorées, générées autour de chaque
 * ville de data/towns.ts. Toutes les maisons du pays tiennent en 2 draw calls
 * (murs + toits) grâce à l'instancing avec couleur par instance.
 */
import * as THREE from 'three';
import { TOWNS } from './data/towns';
import { lonLatToWorld } from './geo';
import { Heightfield } from './Heightfield';
import { Colliders } from './Colliders';
import { makeRng } from '../core/math';
import { PALETTE, FACADES } from '../models/palette';
import { sharedMaterials } from '../models/materials';
import { ModelBuilder } from '../models/ModelBuilder';

const HOUSES_BY_SIZE = [5, 12, 26, 48];
const SPREAD_BY_SIZE = [12, 20, 34, 52];

export interface TownInfo {
  name: string;
  x: number;
  z: number;
  radius: number;
}

export class Towns {
  readonly group = new THREE.Group();
  readonly list: TownInfo[] = [];

  constructor(hf: Heightfield, colliders: Colliders, reserved: (x: number, z: number) => boolean = () => false) {
    this.group.name = 'towns';
    for (const t of TOWNS) {
      const p = lonLatToWorld(t.lon, t.lat);
      this.list.push({ name: t.name, x: p.x, z: p.z, radius: SPREAD_BY_SIZE[t.size] + 6 });
    }

    // Géométries unitaires (1×1×1) — mises à l'échelle par instance
    const b = new ModelBuilder();
    b.box(1, 1, 1, 'white');
    // Les couleurs ci-dessous sont MULTIPLIÉES par la couleur de façade de chaque maison
    b.box(0.16, 0.42, 0.03, 0x5a3a30, { z: 0.505, y: 0 }); // porte
    b.box(0.18, 0.16, 0.03, 0x46607a, { x: -0.28, y: 0.5, z: 0.505 }); // fenêtre
    b.box(0.18, 0.16, 0.03, 0x46607a, { x: 0.28, y: 0.5, z: 0.505 }); // fenêtre
    b.box(1.02, 0.06, 1.02, 0xb8b8b8, { y: 0 }); // soubassement
    const bodyGeo = b.build();
    b.roof(1.08, 0.55, 1.12, 'white');
    b.box(0.12, 0.35, 0.12, 0x9a9a9a, { x: 0.3, y: 0.25 }); // cheminée
    const roofGeo = b.build();

    const bodies: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    const roofs: { m: THREE.Matrix4; c: THREE.Color }[] = [];

    TOWNS.forEach((t, ti) => {
      const center = this.list[ti];
      const rng = makeRng(9000 + ti * 131);
      const count = HOUSES_BY_SIZE[t.size];
      const spread = SPREAD_BY_SIZE[t.size];
      let placed = 0;
      for (let attempt = 0; attempt < count * 6 && placed < count; attempt++) {
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * spread;
        const x = center.x + Math.cos(a) * r;
        const z = center.z + Math.sin(a) * r;
        const w = 3 + rng() * 2.5;
        const d = 3 + rng() * 1.5;
        const h = 2.6 + rng() * (t.size >= 2 ? 3.5 : 1.5);
        const rad = Math.hypot(w, d) / 2;
        if (hf.roadDistanceAt(x, z) < 5 + rad) continue;
        const y = hf.heightAt(x, z);
        if (y < 1 || hf.slopeAt(x, z) > 0.5) continue;
        if (colliders.blocked(x, z, rad + 0.5) || reserved(x, z)) continue;
        // Orienter la façade vers la route la plus proche (approximation : vers le centre)
        const rot = Math.round((Math.atan2(center.x - x, center.z - z) / (Math.PI / 2))) * (Math.PI / 2) + (rng() - 0.5) * 0.2;
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        const facade = new THREE.Color(PALETTE[FACADES[Math.floor(rng() * FACADES.length)]]);
        const roofCol = new THREE.Color(rng() < (t.size === 0 ? 0.6 : 0.15) ? PALETTE.thatch : PALETTE.slate);
        bodies.push({ m: new THREE.Matrix4().compose(new THREE.Vector3(x, y - 0.3, z), q, new THREE.Vector3(w, h + 0.3, d)), c: facade });
        roofs.push({ m: new THREE.Matrix4().compose(new THREE.Vector3(x, y + h, z), q, new THREE.Vector3(w, Math.min(w, d) * 0.9, d)), c: roofCol });
        colliders.add(`town:${t.name}`, { kind: 'box', x, z, hw: w / 2, hd: d / 2, rot });
        placed++;
      }
    });

    const mk = (geo: THREE.BufferGeometry, items: { m: THREE.Matrix4; c: THREE.Color }[]) => {
      const im = new THREE.InstancedMesh(geo, sharedMaterials().world, items.length);
      items.forEach((it, i) => {
        im.setMatrixAt(i, it.m);
        im.setColorAt(i, it.c);
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = true;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      im.frustumCulled = false;
      return im;
    };
    this.group.add(mk(bodyGeo, bodies), mk(roofGeo, roofs));
  }

  /** Ville la plus proche d'un point (et sa distance). */
  nearest(x: number, z: number) {
    let best: TownInfo | null = null;
    let bd = Infinity;
    for (const t of this.list) {
      const d = Math.hypot(x - t.x, z - t.z);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    return { town: best!, distance: bd };
  }

  /** Vrai si (x, z) est dans l'emprise d'une ville. */
  isInTown(x: number, z: number) {
    for (const t of this.list) if (Math.abs(x - t.x) < t.radius && Math.abs(z - t.z) < t.radius && Math.hypot(x - t.x, z - t.z) < t.radius) return true;
    return false;
  }
}
