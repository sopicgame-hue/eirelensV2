/**
 * Projection géographique : (longitude, latitude) réelles  →  (x, z) monde.
 *
 * C'est LA règle d'or pour placer quoi que ce soit dans le monde :
 *   - On récupère les coordonnées GPS sur Google Maps (clic droit → coordonnées).
 *   - Google donne "latitude, longitude" (ex : 55.2408, -6.5116).
 *   - On les écrit dans les données sous la forme { lat: 55.2408, lon: -6.5116 }.
 *   - On appelle lonLatToWorld(lon, lat) pour obtenir la position 3D.
 *
 * Projection équirectangulaire corrigée par cos(latitude d'origine) — largement
 * suffisante pour un pays de la taille de l'Irlande.
 */
import { WORLD } from '../config/gameConfig';

const COS_LAT0 = Math.cos((WORLD.ORIGIN_LAT * Math.PI) / 180);
const K = WORLD.UNITS_PER_DEG_LAT;

export interface LonLat {
  lon: number;
  lat: number;
}

export function lonLatToWorld(lon: number, lat: number): { x: number; z: number } {
  return {
    x: (lon - WORLD.ORIGIN_LON) * COS_LAT0 * K,
    z: -(lat - WORLD.ORIGIN_LAT) * K, // nord = -Z
  };
}

export function worldToLonLat(x: number, z: number): LonLat {
  return {
    lon: x / (COS_LAT0 * K) + WORLD.ORIGIN_LON,
    lat: -z / K + WORLD.ORIGIN_LAT,
  };
}

/** Convertit une liste plate [lon, lat, lon, lat, ...] en liste plate [x, z, x, z, ...]. */
export function projectFlat(flat: number[]): Float32Array {
  const out = new Float32Array(flat.length);
  for (let i = 0; i < flat.length; i += 2) {
    const p = lonLatToWorld(flat[i], flat[i + 1]);
    out[i] = p.x;
    out[i + 1] = p.z;
  }
  return out;
}

/** Convertit des kilomètres réels en unités monde (horizontal). */
export const kmToUnits = (km: number) => (km / 111.2) * K;

/** Convertit une altitude réelle (mètres) en unités monde (vertical, exagéré). */
export const metersToHeight = (m: number) => m * WORLD.VERTICAL_SCALE;

/** Emprise du monde en coordonnées monde. */
export function worldBounds() {
  const a = lonLatToWorld(WORLD.BOUNDS.minLon, WORLD.BOUNDS.maxLat);
  const b = lonLatToWorld(WORLD.BOUNDS.maxLon, WORLD.BOUNDS.minLat);
  return { minX: a.x, minZ: a.z, maxX: b.x, maxZ: b.z };
}
