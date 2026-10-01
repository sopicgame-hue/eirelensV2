/**
 * Villes : petites maisons aux façades colorées, générées autour de chaque
 * ville de data/towns.ts, + une ÉGLISE par bourg/ville et un PUB partout
 * (modèles dans models/townBuildings.ts). Toutes les maisons du pays tiennent
 * en 2 draw calls (murs + toits), églises et pubs en 4, grâce à l'instancing.
 * Ordre de placement : églises, pubs, puis maisons (les plus gros d'abord).
 */
import * as THREE from 'three';
import { TOWNS } from './data/towns';
import { lonLatToWorld } from './geo';
import { Heightfield } from './Heightfield';
import { Colliders } from './Colliders';
import { makeRng } from '../core/math';
import { TERRAIN } from '../config/gameConfig';
import { PALETTE, FACADES } from '../models/palette';
import { sharedMaterials } from '../models/materials';
import { ModelBuilder } from '../models/ModelBuilder';
import { buildChurchGeometry, buildPubGeometries, CHURCH_SIZE, PUB_SIZE } from '../models/townBuildings';

const HOUSES_BY_SIZE = [5, 12, 26, 48];
const SPREAD_BY_SIZE = [12, 20, 34, 52];
/** Églises et pubs par taille de localité (0 = hameau … 3 = grande ville). */
/** Coins normalisés d'une emprise rectangulaire (vérifiés au placement des églises et pubs). */
const CORNERS: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
const CHURCHES_BY_SIZE = [0, 1, 1, 2];
const PUBS_BY_SIZE = [1, 1, 2, 3];
/** Les églises des grandes villes sont un peu plus grandes. */
const CHURCH_SCALE_BY_SIZE = [1, 1, 1.12, 1.25];

type Instance = { m: THREE.Matrix4; c?: THREE.Color };

export interface TownInfo {
  name: string;
  x: number;
  z: number;
  radius: number;
}

export class Towns {
  readonly group = new THREE.Group();
  readonly list: TownInfo[] = [];
  /** Nombre de bâtiments posés (débogage : __eirelens.towns.counts). */
  counts = { houses: 0, churches: 0, pubs: 0 };

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

    const bodies: Instance[] = [];
    const roofs: Instance[] = [];
    const churchesStone: Instance[] = [];
    const churchesWhite: Instance[] = [];
    const pubShells: Instance[] = [];
    const pubFronts: Instance[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    /**
     * Pose un bâtiment spécial (église, pub) près du centre, façade vers le centre.
     * @returns la matrice, ou null si aucune place libre n'a été trouvée.
     */
    const placeSpecial = (townName: string, cx: number, cz: number, rng: () => number, hw: number, hd: number, scale: number, maxR: number) => {
      const rad = Math.hypot(hw, hd) * scale;
      for (let attempt = 0; attempt < 160; attempt++) {
        const a = rng() * Math.PI * 2;
        // le rayon de recherche s'élargit (jusqu'à ×2) si le centre est encombré
        const r = 3 + Math.sqrt(rng()) * maxR * (1 + attempt / 160);
        const x = cx + Math.cos(a) * r;
        const z = cz + Math.sin(a) * r;
        if (hf.roadDistanceAt(x, z) < 3 + Math.min(hw, hd) * scale + 2) continue;
        const y = hf.heightAt(x, z);
        if (y < 1 || hf.slopeAt(x, z) > 0.4) continue;
        if (colliders.blocked(x, z, rad + 0.8) || reserved(x, z)) continue;
        const rot = Math.atan2(cx - x, cz - z);
        // Les 4 coins aussi : hors des routes, des gares (voies) et des monuments
        const c = Math.cos(rot), s = Math.sin(rot);
        let cornersOk = true;
        for (const [lx, lz] of CORNERS) {
          const ox = lx * hw * scale;
          const oz = lz * hd * scale;
          const wx = x + ox * c + oz * s;
          const wz = z - ox * s + oz * c;
          if (reserved(wx, wz) || hf.roadDistanceAt(wx, wz) < TERRAIN.ROAD_WIDTH / 2 + 0.5) {
            cornersOk = false;
            break;
          }
        }
        if (!cornersOk) continue;
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y - 0.15, z), new THREE.Quaternion().setFromAxisAngle(up, rot), new THREE.Vector3(scale, scale, scale));
        colliders.add(`town:${townName}`, { kind: 'box', x, z, hw: hw * scale, hd: hd * scale, rot });
        return m;
      }
      return null;
    };

    TOWNS.forEach((t, ti) => {
      const center = this.list[ti];
      const rng = makeRng(9000 + ti * 131);
      // Églises puis pubs, au plus près du centre
      const special = makeRng(4000 + ti * 77);
      for (let k = 0; k < CHURCHES_BY_SIZE[t.size]; k++) {
        const m = placeSpecial(t.name, center.x, center.z, special, CHURCH_SIZE.hw, CHURCH_SIZE.hd, CHURCH_SCALE_BY_SIZE[t.size], SPREAD_BY_SIZE[t.size] * 0.7);
        if (m) (special() < 0.5 ? churchesStone : churchesWhite).push({ m });
      }
      for (let k = 0; k < PUBS_BY_SIZE[t.size]; k++) {
        const m = placeSpecial(t.name, center.x, center.z, special, PUB_SIZE.hw, PUB_SIZE.hd, 1, SPREAD_BY_SIZE[t.size] * 0.6);
        if (!m) continue;
        pubShells.push({ m, c: new THREE.Color(PALETTE[FACADES[Math.floor(special() * FACADES.length)]]) });
        pubFronts.push({ m });
      }
      const count = HOUSES_BY_SIZE[t.size];
      const spread = SPREAD_BY_SIZE[t.size];
      let placed = 0;
      let farthest = 0;
      // Après count × 6 essais (ville encombrée : monument, gare, routes), on continue
      // en élargissant peu à peu le rayon (jusqu'à ×1,6) pour que la ville reste fournie.
      const base = count * 6;
      for (let attempt = 0; attempt < base * 2 && placed < count; attempt++) {
        const a = rng() * Math.PI * 2;
        const grow = attempt < base ? 1 : 1 + (0.6 * (attempt - base)) / base;
        const r = Math.sqrt(rng()) * spread * grow;
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
        farthest = Math.max(farthest, r + rad);
      }
      // la zone "en ville" (pas d'arbres, nom dans le HUD) couvre toutes les maisons posées
      center.radius = Math.max(center.radius, farthest + 4);
    });

    const mk = (geo: THREE.BufferGeometry, items: Instance[]) => {
      const im = new THREE.InstancedMesh(geo, sharedMaterials().world, Math.max(1, items.length));
      im.count = items.length;
      items.forEach((it, i) => {
        im.setMatrixAt(i, it.m);
        if (it.c) im.setColorAt(i, it.c); // couleur par instance (sinon : couleurs du modèle)
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = true;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      im.frustumCulled = false;
      return im;
    };
    const pub = buildPubGeometries();
    this.group.add(
      mk(bodyGeo, bodies),
      mk(roofGeo, roofs),
      mk(buildChurchGeometry('stone'), churchesStone),
      mk(buildChurchGeometry('whitewash'), churchesWhite),
      mk(pub.shell, pubShells),
      mk(pub.front, pubFronts),
    );
    this.counts = { houses: bodies.length, churches: churchesStone.length + churchesWhite.length, pubs: pubShells.length };
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
