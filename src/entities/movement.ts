/**
 * Déplacement au sol commun à TOUTES les entités (joueur, mouton, véhicules).
 * Gère : pentes trop raides, bords de falaise, eau, obstacles (Colliders).
 * Règle : aucune entité ne doit modifier sa position x/z sans passer par moveEntity().
 */
import { Heightfield } from '../world/Heightfield';
import { Colliders } from '../world/Colliders';
import { WORLD } from '../config/gameConfig';

export interface MoveParams {
  radius: number;
  /** Pente max en montée (1 = 45°). */
  maxSlope: number;
  medium: 'land' | 'water';
  /** Profondeur d'eau max tolérée (land). */
  maxWade: number;
}

export interface WorldRefs {
  hf: Heightfield;
  colliders: Colliders;
}

const MIN_BOAT_DEPTH = 0.8;

export function canStand(w: WorldRefs, x: number, z: number, p: MoveParams) {
  const depth = WORLD.WATER_LEVEL - w.hf.heightAt(x, z);
  if (p.medium === 'water') return depth >= MIN_BOAT_DEPTH;
  return depth <= p.maxWade;
}

function stepOk(w: WorldRefs, fx: number, fz: number, x: number, z: number, p: MoveParams) {
  if (!canStand(w, x, z, p)) {
    // Autoriser à SORTIR d'une zone interdite (ex : apparition dans l'eau)
    if (!canStand(w, fx, fz, p)) {
      const depth0 = WORLD.WATER_LEVEL - w.hf.heightAt(fx, fz);
      const depth1 = WORLD.WATER_LEVEL - w.hf.heightAt(x, z);
      return p.medium === 'land' ? depth1 < depth0 : depth1 > depth0;
    }
    return false;
  }
  if (p.medium === 'water') return true;
  const d = Math.hypot(x - fx, z - fz);
  if (d < 1e-5) return true;
  const grade = (w.hf.heightAt(x, z) - w.hf.heightAt(fx, fz)) / d;
  if (grade > p.maxSlope) return false; // trop raide en montée
  if (grade < -p.maxSlope * 1.8) return false; // bord de falaise : on ne saute pas !
  return true;
}

/**
 * Tente de déplacer (x, z) → (x + dx, z + dz). Glisse le long des obstacles.
 * @returns la nouvelle position et `blocked` si le mouvement a été (en partie) refusé.
 */
export function moveEntity(w: WorldRefs, x: number, z: number, dx: number, dz: number, p: MoveParams) {
  let nx = x + dx;
  let nz = z + dz;
  let blocked = false;
  if (!stepOk(w, x, z, nx, nz, p)) {
    blocked = true;
    if (stepOk(w, x, z, x + dx, z, p)) {
      nx = x + dx;
      nz = z;
    } else if (stepOk(w, x, z, x, z + dz, p)) {
      nx = x;
      nz = z + dz;
    } else {
      return { x, z, blocked };
    }
  }
  const r = w.colliders.resolve(nx, nz, p.radius);
  if (r.hit) {
    blocked = true;
    if (!stepOk(w, x, z, r.x, r.z, p)) return { x, z, blocked };
    return { x: r.x, z: r.z, blocked };
  }
  return { x: nx, z: nz, blocked };
}

/** Cherche le point valide le plus proche (anneaux concentriques) — pour débarquer, poser un véhicule… */
export function findNearest(w: WorldRefs, x: number, z: number, p: MoveParams, maxRadius = 12) {
  if (canStand(w, x, z, p) && !w.colliders.blocked(x, z, p.radius)) return { x, z };
  for (let r = 1; r <= maxRadius; r += 1) {
    const n = Math.ceil(r * 4);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const px = x + Math.cos(a) * r;
      const pz = z + Math.sin(a) * r;
      if (canStand(w, px, pz, p) && !w.colliders.blocked(px, pz, p.radius) && (p.medium === 'water' || w.hf.slopeAt(px, pz) < p.maxSlope)) return { x: px, z: pz };
    }
  }
  return null;
}
