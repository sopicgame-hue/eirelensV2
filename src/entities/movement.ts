/**
 * Déplacement commun à TOUTES les entités (joueur, mouton, véhicules).
 * Gère : pentes trop raides, bords de falaise, eau, obstacles (Colliders)
 * et le "mur invisible" des zones verrouillées (WorldRefs.canEnter).
 * Règle : aucune entité ne doit modifier sa position x/z sans passer par moveEntity().
 */
import { Heightfield } from '../world/Heightfield';
import { Colliders } from '../world/Colliders';
import { WORLD } from '../config/gameConfig';

export interface MoveParams {
  radius: number;
  /** Pente max en montée (1 = 45°). */
  maxSlope: number;
  /** 'land' : à pied / roues ; 'water' : bateau ; 'air' : en vol (ignore relief et obstacles). */
  medium: 'land' | 'water' | 'air';
  /** Profondeur d'eau max tolérée (land). */
  maxWade: number;
}

export interface WorldRefs {
  hf: Heightfield;
  colliders: Colliders;
  /** Mur invisible : faux si (x, z) est dans une zone verrouillée ou hors carte. */
  canEnter?: (x: number, z: number) => boolean;
}

const MIN_BOAT_DEPTH = 0.8;

export function canStand(w: WorldRefs, x: number, z: number, p: MoveParams) {
  if (p.medium === 'air') return true;
  const depth = WORLD.WATER_LEVEL - w.hf.heightAt(x, z);
  if (p.medium === 'water') return depth >= MIN_BOAT_DEPTH;
  return depth <= p.maxWade;
}

/** Vrai si (x, z) est dans une zone fermée alors qu'on vient d'une zone ouverte. */
function zoneWall(w: WorldRefs, fx: number, fz: number, x: number, z: number) {
  return !!w.canEnter && !w.canEnter(x, z) && w.canEnter(fx, fz);
}

function stepOk(w: WorldRefs, fx: number, fz: number, x: number, z: number, p: MoveParams) {
  if (zoneWall(w, fx, fz, x, z)) return false;
  if (p.medium === 'air') return true;
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
 * @returns la nouvelle position, `blocked` si le mouvement a été (en partie) refusé,
 *          et `zoneBlocked` si c'est le mur d'une zone verrouillée qui a bloqué.
 */
export function moveEntity(w: WorldRefs, x: number, z: number, dx: number, dz: number, p: MoveParams) {
  let nx = x + dx;
  let nz = z + dz;
  let blocked = false;
  const zoneBlocked = zoneWall(w, x, z, nx, nz);
  if (!stepOk(w, x, z, nx, nz, p)) {
    blocked = true;
    if (stepOk(w, x, z, x + dx, z, p)) {
      nx = x + dx;
      nz = z;
    } else if (stepOk(w, x, z, x, z + dz, p)) {
      nx = x;
      nz = z + dz;
    } else {
      return { x, z, blocked, zoneBlocked };
    }
  }
  if (p.medium === 'air') return { x: nx, z: nz, blocked, zoneBlocked }; // en vol : pas d'obstacles
  const r = w.colliders.resolve(nx, nz, p.radius);
  if (r.hit) {
    blocked = true;
    if (!stepOk(w, x, z, r.x, r.z, p)) return { x, z, blocked, zoneBlocked };
    return { x: r.x, z: r.z, blocked, zoneBlocked };
  }
  return { x: nx, z: nz, blocked, zoneBlocked };
}

/** Cherche le point valide le plus proche (anneaux concentriques) — pour débarquer, poser un véhicule… */
export function findNearest(w: WorldRefs, x: number, z: number, p: MoveParams, maxRadius = 12) {
  const zoneOk = (px: number, pz: number) => !w.canEnter || w.canEnter(px, pz);
  if (canStand(w, x, z, p) && zoneOk(x, z) && !w.colliders.blocked(x, z, p.radius)) return { x, z };
  for (let r = 1; r <= maxRadius; r += 1) {
    const n = Math.ceil(r * 4);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const px = x + Math.cos(a) * r;
      const pz = z + Math.sin(a) * r;
      if (canStand(w, px, pz, p) && zoneOk(px, pz) && !w.colliders.blocked(px, pz, p.radius) && (p.medium !== 'land' || w.hf.slopeAt(px, pz) < p.maxSlope)) return { x: px, z: pz };
    }
  }
  return null;
}
