/**
 * Utilitaires mathématiques purs (aucune dépendance three.js).
 * Tout aléatoire du jeu DOIT passer par `makeRng` (déterministe, seedé) pour que
 * le monde soit identique à chaque partie.
 */

export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
export const smoothstep = (a: number, b: number, v: number) => {
  const t = invLerp(a, b, v);
  return t * t * (3 - 2 * t);
};
/** Lissage indépendant du framerate : rapproche `current` de `target`. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Ramène un angle dans ]-PI, PI]. */
export const wrapAngle = (a: number) => {
  a = (a + Math.PI) % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a - Math.PI;
};
/** Lissage d'angle (prend le plus court chemin). */
export const dampAngle = (current: number, target: number, lambda: number, dt: number) =>
  current + wrapAngle(target - current) * (1 - Math.exp(-lambda * dt));

/** Générateur pseudo-aléatoire déterministe (mulberry32). Retourne [0,1[. */
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash entier 2D → [0,1[ (déterministe). */
export function hash2(x: number, y: number, seed = 0) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + seed * 2147483647;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Bruit de valeur 2D lissé, sortie dans [-1, 1]. */
export function valueNoise(x: number, y: number, seed = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return (lerp(lerp(a, b, u), lerp(c, d, u), v)) * 2 - 1;
}

/** Bruit fractal (somme d'octaves), sortie ≈ [-1, 1]. */
export function fbm(x: number, y: number, octaves = 4, seed = 0) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 17) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

/** Bruit "crêtes" pour les montagnes, sortie [0, 1]. */
export function ridged(x: number, y: number, octaves = 3, seed = 0) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise(x * freq, y * freq, seed + i * 31));
    sum += n * n * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm;
}

/** Distance d'un point (px,pz) à un segment [a,b] en 2D. */
export function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = clamp(t, 0, 1);
  const cx = ax + dx * t;
  const cz = az + dz * t;
  return Math.hypot(px - cx, pz - cz);
}
