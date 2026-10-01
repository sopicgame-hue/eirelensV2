/**
 * WorldGrid — grilles précalculées au démarrage (≈ 100-300 ms) :
 *   - masque eau / terre (mer, lacs, rivières) à partir de irelandGeo.json
 *   - distance signée à la côte (+ sur terre, − dans l'eau), en unités
 *   - distance à la route la plus proche + index de l'échantillon de route
 *
 * Ce fichier ne connaît PAS les hauteurs : voir Heightfield.ts.
 * Ne modifie ce fichier que si tu sais exactement ce que tu fais : tout le
 * relief, les collisions et le placement des objets en dépendent.
 */
import geo from './data/irelandGeo.json';
import { WORLD, TERRAIN } from '../config/gameConfig';
import { lonLatToWorld, projectFlat, worldBounds, kmToUnits } from './geo';
import { TOWNS } from './data/towns';
import { ROUTES, RouteStep } from './data/roads';
import { EXTRA_RIVERS } from './data/rivers';

interface GeoData {
  land: number[][];
  lakes: { name: string; ring: number[] }[];
  rivers: { name: string; widthM: number; line: number[] }[];
}

export interface RoadSample {
  x: number;
  z: number;
  /** Hauteur de la chaussée (remplie par Heightfield). */
  h: number;
  route: number;
}

const MIN_RIVER_WIDTH = 8; // unités : une rivière plus fine que ça ne se voit pas

export class WorldGrid {
  readonly S = WORLD.GRID_SPACING;
  readonly minX: number;
  readonly minZ: number;
  readonly nx: number;
  readonly nz: number;
  /** 1 = eau (mer/lac/rivière), 0 = terre. */
  readonly water: Uint8Array;
  /** 1 = mer (sert uniquement aux avertissements de routes). */
  readonly sea: Uint8Array;
  /** Distance signée à la rive (unités) : > 0 sur terre, < 0 dans l'eau. */
  readonly coast: Float32Array;
  /** Distance à l'échantillon de route le plus proche (unités). */
  readonly roadDist: Float32Array;
  /** Index (dans roadSamples) de l'échantillon le plus proche, -1 si aucun. */
  readonly roadIdx: Int32Array;
  readonly roadSamples: RoadSample[] = [];
  /** Segments de chaque route (indices de début/fin dans roadSamples). */
  readonly routeRanges: { name: string; start: number; end: number }[] = [];

  constructor() {
    const b = worldBounds();
    this.minX = b.minX;
    this.minZ = b.minZ;
    this.nx = Math.ceil((b.maxX - b.minX) / this.S) + 1;
    this.nz = Math.ceil((b.maxZ - b.minZ) / this.S) + 1;
    const n = this.nx * this.nz;
    this.water = new Uint8Array(n).fill(1);
    this.sea = new Uint8Array(n).fill(1);
    this.coast = new Float32Array(n);
    this.roadDist = new Float32Array(n).fill(1e9);
    this.roadIdx = new Int32Array(n).fill(-1);

    const data = geo as GeoData;
    for (const ring of data.land) this.fillPolygon(projectFlat(ring), 0);
    this.sea.set(this.water);
    for (const lake of data.lakes) this.fillPolygon(projectFlat(lake.ring), 1);
    for (const river of data.rivers) {
      const w = Math.max(MIN_RIVER_WIDTH, kmToUnits(river.widthM / 1000));
      this.stampPolyline(projectFlat(river.line), w / 2, 1);
    }
    // Rivières tracées à la main (data/rivers.ts), au format [lat, lon]
    for (const river of EXTRA_RIVERS) {
      const w = Math.max(MIN_RIVER_WIDTH, kmToUnits(river.widthM / 1000));
      this.stampPolyline(projectFlat(river.line.flatMap(([lat, lon]) => [lon, lat])), w / 2, 1);
    }
    this.buildRoads();
    this.computeCoastDistance();
    this.computeRoadDistance();
  }

  // ------------------------------------------------------------------ helpers
  idx(i: number, j: number) {
    return j * this.nx + i;
  }
  vx(i: number) {
    return this.minX + i * this.S;
  }
  vz(j: number) {
    return this.minZ + j * this.S;
  }
  inBounds(i: number, j: number) {
    return i >= 0 && j >= 0 && i < this.nx && j < this.nz;
  }

  /** Distance signée à la côte, interpolée (unités). */
  sampleCoast(x: number, z: number) {
    return this.bilinear(this.coast, x, z, -50);
  }

  bilinear(arr: Float32Array, x: number, z: number, outside: number) {
    const fx = (x - this.minX) / this.S;
    const fz = (z - this.minZ) / this.S;
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    if (i < 0 || j < 0 || i >= this.nx - 1 || j >= this.nz - 1) return outside;
    const tx = fx - i;
    const tz = fz - j;
    const k = this.idx(i, j);
    const a = arr[k];
    const b2 = arr[k + 1];
    const c = arr[k + this.nx];
    const d = arr[k + this.nx + 1];
    return (a * (1 - tx) + b2 * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  }

  // ------------------------------------------------------------ rasterisation
  /** Remplit un polygone (règle pair-impair) avec la valeur `value` dans `water`. */
  private fillPolygon(pts: Float32Array, value: number) {
    const count = pts.length / 2;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let k = 0; k < count; k++) {
      minZ = Math.min(minZ, pts[k * 2 + 1]);
      maxZ = Math.max(maxZ, pts[k * 2 + 1]);
    }
    const j0 = Math.max(0, Math.floor((minZ - this.minZ) / this.S));
    const j1 = Math.min(this.nz - 1, Math.ceil((maxZ - this.minZ) / this.S));
    const xs: number[] = [];
    for (let j = j0; j <= j1; j++) {
      const z = this.vz(j);
      xs.length = 0;
      for (let k = 0; k < count; k++) {
        const ax = pts[k * 2];
        const az = pts[k * 2 + 1];
        const bx = pts[((k + 1) % count) * 2];
        const bz = pts[((k + 1) % count) * 2 + 1];
        if (az <= z !== bz <= z) xs.push(ax + ((z - az) / (bz - az)) * (bx - ax));
      }
      xs.sort((p, q) => p - q);
      for (let m = 0; m + 1 < xs.length; m += 2) {
        const i0 = Math.max(0, Math.ceil((xs[m] - this.minX) / this.S));
        const i1 = Math.min(this.nx - 1, Math.floor((xs[m + 1] - this.minX) / this.S));
        for (let i = i0; i <= i1; i++) this.water[this.idx(i, j)] = value;
      }
    }
  }

  /** Marque toutes les cellules à moins de `radius` d'une polyligne. */
  private stampPolyline(pts: Float32Array, radius: number, value: number) {
    for (let k = 0; k + 3 < pts.length; k += 2) {
      const ax = pts[k];
      const az = pts[k + 1];
      const bx = pts[k + 2];
      const bz = pts[k + 3];
      const len = Math.hypot(bx - ax, bz - az);
      const steps = Math.max(1, Math.ceil(len / (this.S * 0.5)));
      for (let s = 0; s <= steps; s++) {
        const x = ax + ((bx - ax) * s) / steps;
        const z = az + ((bz - az) * s) / steps;
        this.stampDisc(x, z, radius, value);
      }
    }
  }

  private stampDisc(x: number, z: number, radius: number, value: number) {
    const r = Math.ceil(radius / this.S);
    const ci = Math.round((x - this.minX) / this.S);
    const cj = Math.round((z - this.minZ) / this.S);
    for (let j = cj - r; j <= cj + r; j++) {
      for (let i = ci - r; i <= ci + r; i++) {
        if (!this.inBounds(i, j)) continue;
        if (Math.hypot(this.vx(i) - x, this.vz(j) - z) <= radius) this.water[this.idx(i, j)] = value;
      }
    }
  }

  // ------------------------------------------------------------------- routes
  private resolveStep(step: RouteStep) {
    if (typeof step !== 'string') return lonLatToWorld(step.lon, step.lat);
    const town = TOWNS.find((t) => t.name === step);
    if (!town) {
      console.warn(`[routes] Ville inconnue dans roads.ts : "${step}"`);
      return null;
    }
    return lonLatToWorld(town.lon, town.lat);
  }

  private buildRoads() {
    const STEP = 2.5;
    ROUTES.forEach((route, routeIndex) => {
      const pts = route.steps.map((s) => this.resolveStep(s)).filter((p): p is { x: number; z: number } => !!p);
      const start = this.roadSamples.length;
      let seaRun = 0;
      let seaHits = 0;
      for (let k = 0; k + 1 < pts.length; k++) {
        const a = pts[k];
        const b = pts[k + 1];
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        const n = Math.max(1, Math.ceil(len / STEP));
        for (let s = k === 0 ? 0 : 1; s <= n; s++) {
          const x = a.x + ((b.x - a.x) * s) / n;
          const z = a.z + ((b.z - a.z) * s) / n;
          this.roadSamples.push({ x, z, h: 0, route: routeIndex });
          const i = Math.round((x - this.minX) / this.S);
          const j = Math.round((z - this.minZ) / this.S);
          if (this.inBounds(i, j) && this.sea[this.idx(i, j)]) seaHits = Math.max(seaHits, ++seaRun);
          else seaRun = 0;
          // La route "assèche" l'eau qu'elle traverse (chaussée / pont).
          this.stampDisc(x, z, TERRAIN.ROAD_WIDTH * 0.5 + this.S, 0);
        }
      }
      // Un pont de < 40 u (estuaire en ville) est normal ; au-delà, la route coupe une baie.
      if (seaHits * STEP > 40) console.warn(`[routes] "${route.name}" traverse la mer sur ~${Math.round(seaHits * STEP)} u. Ajoute des points intermédiaires.`);
      this.routeRanges.push({ name: route.name, start, end: this.roadSamples.length });
    });
  }

  // -------------------------------------------------------- champs de distance
  /** Transformée de distance chanfreinée (2 passes) — distance signée à la rive. */
  private computeCoastDistance() {
    const { nx, nz, water, coast } = this;
    const INF = 1e9;
    const dIn = new Float32Array(nx * nz); // distance terre → eau
    const dOut = new Float32Array(nx * nz); // distance eau → terre
    for (let k = 0; k < nx * nz; k++) {
      dIn[k] = water[k] ? 0 : INF;
      dOut[k] = water[k] ? INF : 0;
    }
    this.chamfer(dIn);
    this.chamfer(dOut);
    for (let k = 0; k < nx * nz; k++) coast[k] = water[k] ? -dOut[k] * this.S : dIn[k] * this.S;
  }

  private chamfer(d: Float32Array) {
    const { nx, nz } = this;
    const D = 1.41421356;
    for (let j = 0; j < nz; j++) {
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        let v = d[k];
        if (i > 0) v = Math.min(v, d[k - 1] + 1);
        if (j > 0) {
          v = Math.min(v, d[k - nx] + 1);
          if (i > 0) v = Math.min(v, d[k - nx - 1] + D);
          if (i < nx - 1) v = Math.min(v, d[k - nx + 1] + D);
        }
        d[k] = v;
      }
    }
    for (let j = nz - 1; j >= 0; j--) {
      for (let i = nx - 1; i >= 0; i--) {
        const k = j * nx + i;
        let v = d[k];
        if (i < nx - 1) v = Math.min(v, d[k + 1] + 1);
        if (j < nz - 1) {
          v = Math.min(v, d[k + nx] + 1);
          if (i < nx - 1) v = Math.min(v, d[k + nx + 1] + D);
          if (i > 0) v = Math.min(v, d[k + nx - 1] + D);
        }
        d[k] = v;
      }
    }
  }

  /** Propagation du plus proche échantillon de route (transformée "vectorielle"). */
  private computeRoadDistance() {
    const { nx, nz, roadDist, roadIdx, roadSamples } = this;
    roadSamples.forEach((s, n) => {
      const i = Math.round((s.x - this.minX) / this.S);
      const j = Math.round((s.z - this.minZ) / this.S);
      if (!this.inBounds(i, j)) return;
      const k = this.idx(i, j);
      const dd = Math.hypot(this.vx(i) - s.x, this.vz(j) - s.z);
      if (dd < roadDist[k]) {
        roadDist[k] = dd;
        roadIdx[k] = n;
      }
    });
    const tryN = (k: number, i: number, j: number, kn: number) => {
      const n = roadIdx[kn];
      if (n < 0) return;
      const s = roadSamples[n];
      const dd = Math.hypot(this.vx(i) - s.x, this.vz(j) - s.z);
      if (dd < roadDist[k]) {
        roadDist[k] = dd;
        roadIdx[k] = n;
      }
    };
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        if (i > 0) tryN(k, i, j, k - 1);
        if (j > 0) {
          tryN(k, i, j, k - nx);
          if (i > 0) tryN(k, i, j, k - nx - 1);
          if (i < nx - 1) tryN(k, i, j, k - nx + 1);
        }
      }
    for (let j = nz - 1; j >= 0; j--)
      for (let i = nx - 1; i >= 0; i--) {
        const k = j * nx + i;
        if (i < nx - 1) tryN(k, i, j, k + 1);
        if (j < nz - 1) {
          tryN(k, i, j, k + nx);
          if (i < nx - 1) tryN(k, i, j, k + nx + 1);
          if (i > 0) tryN(k, i, j, k + nx - 1);
        }
      }
  }
}
