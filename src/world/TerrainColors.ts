/**
 * Couleur du sol en chaque sommet du relief.
 * Règles (dans l'ordre) : fond marin → plage → falaise/roche → biome → montagne
 * → "patchwork" de champs (les fameuses 40 nuances de vert irlandaises).
 */
import * as THREE from 'three';
import { PALETTE } from '../models/palette';
import { hash2, smoothstep, fbm } from '../core/math';
import { BIOMES } from './data/relief';
import { lonLatToWorld, kmToUnits } from './geo';
import { WORLD } from '../config/gameConfig';

const C = (n: number) => new THREE.Color(n);
const COL = {
  seaFloor: C(PALETTE.seaFloor),
  sand: C(PALETTE.sand),
  rock: C(PALETTE.rock),
  rockDark: C(PALETTE.rockDark),
  heather: C(PALETTE.heather),
  peat: C(PALETTE.peat),
  limestone: C(PALETTE.limestone),
  grassLight: C(PALETTE.grassLight),
  fields: [C(PALETTE.grass), C(PALETTE.grassDark), C(PALETTE.grassLight), C(PALETTE.meadow), C(0x7cc24f), C(0x5aa845)],
};

const biomes = BIOMES.map((b) => ({ ...lonLatToWorld(b.lon, b.lat), r: kmToUnits(b.radiusKm), color: COL[b.color] }));

const tmp = new THREE.Color();

export function terrainColor(out: THREE.Color, x: number, z: number, h: number, slope: number, coast: number, mountain: number) {
  if (h < WORLD.WATER_LEVEL - 0.3) {
    // Fond : sable près du bord, bleu-vert au large
    return out.copy(COL.sand).lerp(COL.seaFloor, smoothstep(-0.3, -3, h));
  }

  // Patchwork de parcelles (cellules de ~45 × 35 unités, légèrement tournées)
  const u = x * 0.94 + z * 0.34;
  const v = -x * 0.34 + z * 0.94;
  const cell = Math.floor(hash2(Math.floor(u / 45), Math.floor(v / 35), WORLD.SEED) * COL.fields.length);
  out.copy(COL.fields[cell]);
  // Légère variation à l'intérieur de la parcelle
  const n = fbm(x / 25, z / 25, 2, WORLD.SEED + 5) * 0.06;
  out.offsetHSL(0, 0, n);

  // Montagne : bruyère puis roche
  if (mountain > 0.15) {
    tmp.copy(COL.heather).lerp(COL.peat, 0.5 + 0.5 * fbm(x / 50, z / 50, 2, 3));
    out.lerp(tmp, smoothstep(0.15, 0.6, mountain) * 0.6);
    out.lerp(COL.rock, smoothstep(0.7, 1, mountain) * 0.7);
  }

  // Biomes
  for (const b of biomes) {
    const d = Math.hypot(x - b.x, z - b.z);
    if (d < b.r) {
      const t = (1 - smoothstep(b.r * 0.5, b.r, d)) * (0.55 + 0.45 * fbm(x / 40, z / 40, 2, 9));
      out.lerp(b.color, Math.min(1, t));
    }
  }

  // Plage
  if (coast < 22 && h < 2.2) out.lerp(COL.sand, 1 - smoothstep(1.2, 2.2, h));

  // Pentes raides = roche nue (falaises)
  if (slope > 0.75) out.lerp(slope > 1.4 ? COL.rockDark : COL.rock, smoothstep(0.75, 1.3, slope));

  return out;
}
