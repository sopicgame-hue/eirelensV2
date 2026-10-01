/**
 * Heightfield — LA source de vérité du relief.
 *
 *   heightAt(x, z)   → hauteur du sol EXACTEMENT comme le mesh affiché
 *                      (même triangulation), donc personnage, mouton,
 *                      véhicules et objets posés ne flottent jamais.
 *   slopeAt(x, z)    → pente (0 = plat, 1 = 45°)
 *   waterDepthAt()   → profondeur d'eau (> 0 = dans l'eau)
 *
 * Composition de la hauteur d'un sommet de grille (dans cet ordre) :
 *   1. relief naturel : distance à la côte + collines (bruit) + massifs + falaises
 *   2. aplanissement autour des villes
 *   3. "tampons" de terrain des monuments (aplanir, îlot, plateau…)
 *   4. routes (profil lissé, chaussées au-dessus de l'eau)
 * Les hauteurs sont calculées à la demande puis mises en cache.
 */
import { WORLD, TERRAIN } from '../config/gameConfig';
import { fbm, ridged, smoothstep, lerp, clamp } from '../core/math';
import { WorldGrid } from './WorldGrid';
import { lonLatToWorld, kmToUnits, metersToHeight } from './geo';
import { MASSIFS, CLIFF_ZONES } from './data/relief';
import { TOWNS } from './data/towns';

/** Modification locale du terrain demandée par un monument (coordonnées monde). */
export interface TerrainStamp {
  /**
   * flatten : force une hauteur (par défaut la hauteur naturelle au centre).
   * island  : garantit un relief minimal en dôme (îlot en mer, colline).
   * mesa    : plateau à bords raides (ex : Rocher de Cashel).
   */
  kind: 'flatten' | 'island' | 'mesa';
  x: number;
  z: number;
  radius: number;
  /** Hauteur cible en unités monde (absolue). Optionnel pour flatten. */
  height?: number;
  /** Largeur de la zone de raccord autour du rayon (unités). Défaut 12. */
  blend?: number;
  /** Hauteur relative : sol naturel en (refX, refZ) + offset (si `height` absent). */
  refX?: number;
  refZ?: number;
  offset?: number;
}

interface MassifW {
  x: number;
  z: number;
  ex: number;
  ez: number;
  rl: number;
  rs: number;
  h: number;
  rugged: number;
  reach: number;
}

const TOWN_RADIUS = [12, 22, 38, 60];

/** Index spatial grossier : ne tester que les éléments proches d'un point. */
class Buckets<T> {
  private map = new Map<number, T[]>();
  private static EMPTY: never[] = [];
  constructor(private cell = 256) {}
  add(item: T, x: number, z: number, reach: number) {
    const c = this.cell;
    for (let j = Math.floor((z - reach) / c); j <= Math.floor((z + reach) / c); j++)
      for (let i = Math.floor((x - reach) / c); i <= Math.floor((x + reach) / c); i++) {
        const k = i * 73856093 ^ j * 19349663;
        let arr = this.map.get(k);
        if (!arr) this.map.set(k, (arr = []));
        arr.push(item);
      }
  }
  query(x: number, z: number): T[] {
    const k = Math.floor(x / this.cell) * 73856093 ^ Math.floor(z / this.cell) * 19349663;
    return this.map.get(k) ?? (Buckets.EMPTY as T[]);
  }
}

export class Heightfield {
  private cache: Float32Array;
  private massifs = new Buckets<MassifW>();
  private cliffs = new Buckets<{ x: number; z: number; r: number; h: number }>();
  private towns = new Buckets<{ x: number; z: number; r: number; h: number }>();
  private stamps = new Buckets<TerrainStamp & { target: number }>();
  readonly seed = WORLD.SEED;

  constructor(readonly grid: WorldGrid, stamps: TerrainStamp[]) {
    this.cache = new Float32Array(grid.nx * grid.nz).fill(NaN);
    for (const m of MASSIFS) {
      const p = lonLatToWorld(m.lon, m.lat);
      const a = ((m.angleDeg ?? 0) * Math.PI) / 180;
      const rs = kmToUnits(m.radiusKm);
      const rl = rs * (m.stretch ?? 1);
      const mw = { x: p.x, z: p.z, ex: Math.cos(a), ez: -Math.sin(a), rl, rs, h: metersToHeight(m.peakM), rugged: m.rugged ?? 0.5, reach: rl * 2 };
      this.massifs.add(mw, p.x, p.z, mw.reach);
    }
    for (const c of CLIFF_ZONES) {
      const p = lonLatToWorld(c.lon, c.lat);
      const r = kmToUnits(c.radiusKm);
      this.cliffs.add({ x: p.x, z: p.z, r, h: metersToHeight(c.heightM) }, p.x, p.z, r);
    }
    for (const t of TOWNS) {
      const p = lonLatToWorld(t.lon, t.lat);
      const h = Math.max(1.4, this.natural(p.x, p.z));
      const r = TOWN_RADIUS[t.size];
      this.towns.add({ x: p.x, z: p.z, r, h }, p.x, p.z, r * 2);
    }
    for (const s of stamps) {
      const rel = s.offset !== undefined && s.refX !== undefined && s.refZ !== undefined;
      const auto = rel ? this.baseNoRoad(s.refX!, s.refZ!, false) + s.offset! : this.baseNoRoad(s.x, s.z, false);
      const st = { ...s, target: s.height ?? Math.max(rel ? 0.4 : 1.2, auto) };
      this.stamps.add(st, s.x, s.z, s.radius + (s.blend ?? 12));
    }
    this.computeRoadProfiles();
  }

  // ===================================================================== API
  /** Hauteur exacte du sol (identique au mesh). */
  heightAt(x: number, z: number) {
    const g = this.grid;
    const fx = (x - g.minX) / g.S;
    const fz = (z - g.minZ) / g.S;
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    if (i < 0 || j < 0 || i >= g.nx - 1 || j >= g.nz - 1) return -TERRAIN.SEA_DEPTH;
    const tx = fx - i;
    const tz = fz - j;
    // Triangulation identique à TerrainChunks : diagonale (i+1,j) — (i,j+1)
    if (tx + tz <= 1) {
      const a = this.vertexHeight(i, j);
      const b = this.vertexHeight(i + 1, j);
      const c = this.vertexHeight(i, j + 1);
      return a + (b - a) * tx + (c - a) * tz;
    }
    const b = this.vertexHeight(i + 1, j);
    const c = this.vertexHeight(i, j + 1);
    const d = this.vertexHeight(i + 1, j + 1);
    return d + (c - d) * (1 - tx) + (b - d) * (1 - tz);
  }

  /** Pente locale (norme du gradient) : 0 = plat, 1 = 45°, 2 ≈ 63°. */
  slopeAt(x: number, z: number) {
    const e = 0.6;
    const dx = this.heightAt(x + e, z) - this.heightAt(x - e, z);
    const dz = this.heightAt(x, z + e) - this.heightAt(x, z - e);
    return Math.hypot(dx, dz) / (2 * e);
  }

  waterDepthAt(x: number, z: number) {
    return WORLD.WATER_LEVEL - this.heightAt(x, z);
  }

  /** Distance à la route la plus proche (unités, approximative). */
  roadDistanceAt(x: number, z: number) {
    const g = this.grid;
    const i = Math.round((x - g.minX) / g.S);
    const j = Math.round((z - g.minZ) / g.S);
    if (!g.inBounds(i, j)) return 1e9;
    return g.roadDist[g.idx(i, j)];
  }

  vertexHeight(i: number, j: number): number {
    const k = this.grid.idx(i, j);
    let h = this.cache[k];
    if (h !== h) {
      h = this.computeVertex(i, j);
      this.cache[k] = h;
    }
    return h;
  }

  /** Infos de "biome" utiles à la coloration (sommet de grille). */
  vertexInfo(i: number, j: number) {
    const g = this.grid;
    const k = g.idx(i, j);
    const x = g.vx(i);
    const z = g.vz(j);
    return { coast: g.coast[k], road: g.roadDist[k], mountain: this.mountainFactor(x, z), x, z };
  }

  // ============================================================== internes
  private computeVertex(i: number, j: number) {
    const g = this.grid;
    const k = g.idx(i, j);
    const x = g.vx(i);
    const z = g.vz(j);
    let h = this.baseNoRoad(x, z, true, g.coast[k]);
    const n = g.roadIdx[k];
    if (n >= 0) {
      const rd = g.roadDist[k];
      const half = TERRAIN.ROAD_WIDTH * 0.5 + 1;
      const blend = 14;
      // Hors de la chaussée, l'eau reste de l'eau (sinon une route longeant une rivière la comblerait)
      if (rd < half + blend && !(g.coast[k] <= 0 && rd > half)) {
        const rh = g.roadSamples[n].h;
        h = lerp(rh, h, smoothstep(half, half + blend, rd));
      }
    }
    return h;
  }

  /** Relief naturel + villes + tampons (sans les routes). */
  private baseNoRoad(x: number, z: number, withStamps: boolean, coastDist?: number) {
    const cd = coastDist ?? this.grid.sampleCoast(x, z);
    let h = this.natural(x, z, cd);
    // Villes aplanies… mais jamais l'eau : les rivières et ports traversant une ville restent visibles
    if (cd > 0)
      for (const t of this.towns.query(x, z)) {
        const d = Math.hypot(x - t.x, z - t.z);
        if (d < t.r * 2) h = lerp(t.h, h, smoothstep(t.r * 0.8, t.r * 2, d));
      }
    if (withStamps) h = this.applyStamps(x, z, h);
    return h;
  }

  private applyStamps(x: number, z: number, h: number) {
    for (const s of this.stamps.query(x, z)) {
      const d = Math.hypot(x - s.x, z - s.z);
      const blend = s.blend ?? 12;
      if (d > s.radius + blend) continue;
      if (s.kind === 'flatten') {
        h = lerp(s.target, h, smoothstep(s.radius, s.radius + blend, d));
      } else if (s.kind === 'island') {
        const t = 1 - smoothstep(0, s.radius + blend, d);
        h = Math.max(h, lerp(-2, s.target, Math.sqrt(t)));
      } else if (s.kind === 'mesa') {
        const t = 1 - smoothstep(s.radius, s.radius + blend, d);
        h = Math.max(h, lerp(h, s.target, t));
      }
    }
    return h;
  }

  /** Relief naturel pur (côtes, collines, massifs, falaises, villes exclues). */
  natural(x: number, z: number, coastDist?: number) {
    const d = coastDist ?? this.grid.sampleCoast(x, z);
    if (d <= 0) {
      // Fond marin / lacustre
      return -Math.min(TERRAIN.SEA_DEPTH, 0.8 + -d * 0.06);
    }
    const sd = this.seed;
    const hills = fbm(x / 420, z / 420, 4, sd) * metersToHeight(TERRAIN.HILLS_AMPLITUDE_M);
    const detail = fbm(x / 60, z / 60, 2, sd + 7) * 0.6;
    const inland = smoothstep(0, TERRAIN.INLAND_RAMP, d);
    let h = metersToHeight(TERRAIN.INLAND_BASE_M) * inland + Math.max(0, hills) * smoothstep(0, 150, d) + detail * smoothstep(0, 40, d);
    h += this.massifHeight(x, z) * smoothstep(0, 22, d);

    // Plage : rampe douce au bord de l'eau
    const beach = Math.min(1.6, 0.35 + d * 0.07);
    h = Math.max(h, 0) * smoothstep(0, TERRAIN.BEACH_WIDTH * 2, d) + beach * (1 - smoothstep(TERRAIN.BEACH_WIDTH, TERRAIN.BEACH_WIDTH * 3, d));

    // Falaises : la terre jaillit presque verticalement de la mer
    for (const c of this.cliffs.query(x, z)) {
      const dc = Math.hypot(x - c.x, z - c.z);
      if (dc > c.r) continue;
      const f = 1 - smoothstep(c.r * 0.55, c.r, dc);
      const top = c.h * (0.85 + 0.15 * fbm(x / 30, z / 30, 2, sd + 3));
      const cliffH = top * smoothstep(0, 6, d) * f;
      h = Math.max(h, cliffH + (h * (1 - f)));
    }
    return h;
  }

  private massifHeight(x: number, z: number) {
    let sum = 0;
    for (const m of this.massifs.query(x, z)) {
      const dx = x - m.x;
      const dz = z - m.z;
      if (Math.abs(dx) > m.reach || Math.abs(dz) > m.reach) continue;
      const u = (dx * m.ex + dz * m.ez) / m.rl;
      const v = (dx * -m.ez + dz * m.ex) / m.rs;
      const r2 = u * u + v * v;
      if (r2 > 4) continue;
      const fall = Math.exp(-r2 * 1.6);
      const rough = 1 - m.rugged * 0.4 + m.rugged * 0.8 * ridged(x / 70, z / 70, 3, this.seed + 11);
      sum = Math.max(sum, m.h * fall * rough);
    }
    return sum;
  }

  /** 0 = plaine, 1 = haute montagne (sert aux couleurs et à la végétation). */
  mountainFactor(x: number, z: number) {
    return clamp(this.massifHeight(x, z) / metersToHeight(600), 0, 1);
  }

  private computeRoadProfiles() {
    const samples = this.grid.roadSamples;
    const raw = samples.map((s) => this.baseNoRoad(s.x, s.z, true));
    const W = 10; // demi-fenêtre de lissage (échantillons)
    for (const r of this.grid.routeRanges) {
      for (let n = r.start; n < r.end; n++) {
        let sum = 0;
        let cnt = 0;
        for (let m = Math.max(r.start, n - W); m <= Math.min(r.end - 1, n + W); m++) {
          sum += raw[m];
          cnt++;
        }
        samples[n].h = Math.max(1.0, sum / cnt);
      }
    }
  }
}
