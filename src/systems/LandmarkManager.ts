/**
 * LandmarkManager — place les monuments dans le monde.
 *   - fournit les tampons de terrain (avant la création du relief)
 *   - fait apparaître / disparaître les modèles 3D selon la distance
 *   - enregistre leurs collisions
 *   - calcule le point focal monde de chaque monument (pour la photo)
 * Aucune donnée de monument ici : tout vient de content/landmarks/.
 */
import * as THREE from 'three';
import { LandmarkDef } from '../content/landmarks/types';
import { buildPlaceholder } from '../content/landmarks/_placeholder';
import { lonLatToWorld } from '../world/geo';
import { Heightfield, TerrainStamp } from '../world/Heightfield';
import { Colliders, ColliderShape } from '../world/Colliders';
import { STREAMING, WORLD } from '../config/gameConfig';
import { makeRng, hash2 } from '../core/math';
import { sharedMaterials } from '../models/materials';

export interface PlacedLandmark {
  /** (non readonly : une animation en erreur est désactivée en remplaçant def) */
  def: LandmarkDef;
  x: number;
  z: number;
  rot: number;
  object: THREE.Object3D | null;
  /** Zones dégagées en coordonnées monde (centre + clearAreas). */
  clear: { x: number; z: number; r: number }[];
}

/** Local (dx, dz) → monde, avec la même convention que object.rotation.y. */
export function localToWorld(x: number, z: number, rot: number, dx: number, dz: number) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return { x: x + dx * c + dz * s, z: z - dx * s + dz * c };
}

export function landmarkStamps(defs: LandmarkDef[]): TerrainStamp[] {
  const out: TerrainStamp[] = [];
  for (const d of defs) {
    const p = lonLatToWorld(d.lon, d.lat);
    const rot = ((d.rotationDeg ?? 0) * Math.PI) / 180;
    for (const s of d.terrain ?? []) {
      const w = localToWorld(p.x, p.z, rot, s.dx ?? 0, s.dz ?? 0);
      out.push({ kind: s.kind, x: w.x, z: w.z, radius: s.radius, height: s.height, blend: s.blend, ...(s.offset !== undefined ? { refX: p.x, refZ: p.z, offset: s.offset } : {}) });
    }
  }
  return out;
}

export class LandmarkManager {
  readonly group = new THREE.Group();
  readonly placed: PlacedLandmark[];

  constructor(
    defs: LandmarkDef[],
    private hf: Heightfield,
    private colliders: Colliders,
  ) {
    this.group.name = 'landmarks';
    const ids = new Set<string>();
    this.placed = defs.map((def) => {
      if (ids.has(def.id)) console.error(`[landmarks] id en double : ${def.id}`);
      ids.add(def.id);
      const p = lonLatToWorld(def.lon, def.lat);
      const rot = ((def.rotationDeg ?? 0) * Math.PI) / 180;
      const clear = [{ x: p.x, z: p.z, r: def.clearRadius }];
      for (const a of def.clearAreas ?? []) {
        const w = localToWorld(p.x, p.z, rot, a.dx, a.dz);
        clear.push({ x: w.x, z: w.z, r: a.radius });
      }
      return { def, x: p.x, z: p.z, rot, object: null, clear };
    });
  }

  get(id: string) {
    return this.placed.find((p) => p.def.id === id);
  }

  /** Vrai si (x, z) est dans la zone dégagée d'un monument. */
  isReserved(x: number, z: number) {
    for (const p of this.placed)
      for (const c of p.clear) if (Math.abs(x - c.x) < c.r && Math.abs(z - c.z) < c.r && Math.hypot(x - c.x, z - c.z) < c.r) return true;
    return false;
  }

  /** Point focal monde (pour la photo et la boussole). */
  focusOf(p: PlacedLandmark, out = new THREE.Vector3()) {
    const [dx, dy, dz] = p.def.photo.focus;
    const w = localToWorld(p.x, p.z, p.rot, dx, dz);
    return out.set(w.x, this.hf.heightAt(w.x, w.z) + dy, w.z);
  }

  /**
   * @param maxSpawns nombre max de monuments construits par appel (1 par frame
   *                  évite les saccades ; Infinity au chargement).
   */
  update(px: number, pz: number, maxSpawns = 1) {
    let spawned = 0;
    for (const p of this.placed) {
      const d = Math.hypot(px - p.x, pz - p.z);
      if (!p.object && d < STREAMING.LANDMARK_SPAWN_DISTANCE && spawned < maxSpawns) {
        this.spawn(p);
        spawned++;
      } else if (p.object && d > STREAMING.LANDMARK_DESPAWN_DISTANCE) this.despawn(p);
    }
  }

  /** Anime les monuments chargés qui ont un `animate` (dauphin, cascade…). */
  animate(dt: number, time: number) {
    for (const p of this.placed) {
      if (!p.object || !p.def.animate || p.def.status !== 'done') continue;
      try {
        p.def.animate(p.object, dt, time);
      } catch (e) {
        console.error(`[landmarks] erreur d'animation de "${p.def.id}" (animation désactivée)`, e);
        p.def = { ...p.def, animate: undefined };
      }
    }
  }

  private spawn(p: PlacedLandmark) {
    const y0 = this.hf.heightAt(p.x, p.z);
    const ctx = {
      groundAt: (dx: number, dz: number) => {
        const w = localToWorld(p.x, p.z, p.rot, dx, dz);
        return this.hf.heightAt(w.x, w.z) - y0;
      },
      waterY: WORLD.WATER_LEVEL - y0,
      rng: makeRng(Math.floor(hash2(Math.round(p.x), Math.round(p.z), 77) * 1e9)),
    };
    let obj: THREE.Object3D;
    try {
      obj = p.def.build && p.def.status === 'done' ? p.def.build(ctx) : buildPlaceholder();
    } catch (e) {
      console.error(`[landmarks] erreur de construction de "${p.def.id}", cairn provisoire utilisé`, e);
      obj = buildPlaceholder();
    }
    obj.position.set(p.x, y0, p.z);
    obj.rotation.y = p.rot;
    obj.name = `landmark:${p.def.id}`;
    this.group.add(obj);
    p.object = obj;

    const shapes: ColliderShape[] = p.def.colliders ?? (p.def.status === 'placeholder' || !p.def.build ? [{ kind: 'circle', x: 0, z: 0, r: 2.2 }] : []);
    for (const s of shapes) {
      const w = localToWorld(p.x, p.z, p.rot, s.x, s.z);
      if (s.kind === 'circle') this.colliders.add(`landmark:${p.def.id}`, { kind: 'circle', x: w.x, z: w.z, r: s.r });
      else this.colliders.add(`landmark:${p.def.id}`, { kind: 'box', x: w.x, z: w.z, hw: s.hw, hd: s.hd, rot: s.rot + p.rot });
    }
  }

  private despawn(p: PlacedLandmark) {
    if (!p.object) return;
    this.group.remove(p.object);
    const shared = new Set<THREE.Material>(Object.values(sharedMaterials()));
    p.object.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      // userData.sharedGeometry = true sur un mesh dont la géométrie est partagée (ex : natureGeometries())
      if (!m.userData.sharedGeometry) m.geometry.dispose();
      if ((m as THREE.InstancedMesh).isInstancedMesh) (m as THREE.InstancedMesh).dispose();
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) if (!shared.has(mat)) mat.dispose();
    });
    p.object = null;
    this.colliders.removeOwner(`landmark:${p.def.id}`);
  }
}
