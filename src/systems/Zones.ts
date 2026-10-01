/**
 * Zones — découpage de la carte en 4 zones (données : world/data/zones.ts).
 *
 *   zoneAt(x, z)    → la zone qui contient ce point (mer comprise)
 *   canEnter(x, z)  → faux si la zone est verrouillée OU hors de la carte
 *                     (= le "mur invisible", utilisé par moveEntity)
 *
 * Quelles zones sont ouvertes ? → décidé par Progression (save.zones).
 * Ce système ne fait que répondre "où suis-je ?" et "ai-je le droit ?".
 */
import { ZONES, ZoneDef, ZoneId } from '../world/data/zones';
import { lonLatToWorld, worldBounds } from '../world/geo';

interface ZonePoly {
  def: ZoneDef;
  /** x0, z0, x1, z1… en coordonnées monde. */
  pts: Float32Array;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Marge (u) autour de la carte au-delà de laquelle on ne peut plus aller (bateau, ULM). */
const MAP_MARGIN = 60;

export class Zones {
  private polys: ZonePoly[] = [];
  private fallback: ZoneDef;
  private bounds = worldBounds();
  /** Ids des zones ouvertes : tenu à jour par Game à partir de la sauvegarde. */
  unlocked = new Set<ZoneId>(['sud']);
  /** Outil de test : tout est ouvert. */
  openAll = false;

  constructor() {
    const fb = ZONES.find((z) => z.fallback);
    if (!fb) throw new Error('[zones] il faut une zone `fallback: true`');
    this.fallback = fb;
    for (const def of ZONES) {
      if (def.fallback || def.polygon.length < 3) continue;
      const pts = new Float32Array(def.polygon.length * 2);
      let minX = Infinity;
      let maxX = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;
      def.polygon.forEach(([lat, lon], i) => {
        const w = lonLatToWorld(lon, lat);
        pts[i * 2] = w.x;
        pts[i * 2 + 1] = w.z;
        minX = Math.min(minX, w.x);
        maxX = Math.max(maxX, w.x);
        minZ = Math.min(minZ, w.z);
        maxZ = Math.max(maxZ, w.z);
      });
      this.polys.push({ def, pts, minX, maxX, minZ, maxZ });
    }
  }

  get all() {
    return ZONES;
  }

  get(id: ZoneId) {
    return ZONES.find((z) => z.id === id)!;
  }

  /** Zones triées dans l'ordre de déblocage. */
  get ordered() {
    return [...ZONES].sort((a, b) => a.order - b.order);
  }

  zoneAt(x: number, z: number): ZoneDef {
    for (const p of this.polys) {
      if (x < p.minX || x > p.maxX || z < p.minZ || z > p.maxZ) continue;
      if (pointInPolygon(p.pts, x, z)) return p.def;
    }
    return this.fallback;
  }

  isOpen(id: ZoneId) {
    return this.openAll || this.unlocked.has(id);
  }

  inMap(x: number, z: number) {
    const b = this.bounds;
    return x > b.minX - MAP_MARGIN && x < b.maxX + MAP_MARGIN && z > b.minZ - MAP_MARGIN && z < b.maxZ + MAP_MARGIN;
  }

  /** Le "mur invisible" : vrai si l'on a le droit d'être en (x, z). */
  canEnter = (x: number, z: number) => this.inMap(x, z) && this.isOpen(this.zoneAt(x, z).id);

  /** Position monde de la gare d'une zone. */
  stationPos(id: ZoneId) {
    const s = this.get(id).station;
    return lonLatToWorld(s.lon, s.lat);
  }
}

/** Test "point dans polygone" (règle pair-impair). */
function pointInPolygon(pts: Float32Array, x: number, z: number) {
  let inside = false;
  const n = pts.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[i * 2];
    const zi = pts[i * 2 + 1];
    const xj = pts[j * 2];
    const zj = pts[j * 2 + 1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
