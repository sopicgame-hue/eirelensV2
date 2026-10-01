/**
 * Colliders — obstacles statiques en 2D (vue de dessus, plan XZ).
 *
 * Le relief n'est PAS géré ici : pentes trop raides et eau profonde sont
 * gérées par Heightfield + le contrôleur du joueur. Ici on gère tout ce qui
 * est "posé" sur le sol : arbres, rochers, maisons, monuments, murets.
 *
 * Deux formes seulement (simples et robustes) :
 *   - cercle  { kind:'circle', x, z, r }
 *   - boîte   { kind:'box', x, z, hw, hd, rot }  (demi-largeur/demi-profondeur, rotation Y)
 * Chaque collider a un `owner` (ex : 'scatter:12,40', 'town:Galway', 'landmark:cliffs_of_moher')
 * pour pouvoir tous les retirer d'un coup quand l'objet disparaît.
 */

export type ColliderShape =
  | { kind: 'circle'; x: number; z: number; r: number }
  | { kind: 'box'; x: number; z: number; hw: number; hd: number; rot: number };

export type Collider = ColliderShape & { owner: string };

const CELL = 16;

export class Colliders {
  private cells = new Map<number, Collider[]>();
  private byOwner = new Map<string, Collider[]>();

  add(owner: string, shape: ColliderShape) {
    const c = { ...shape, owner } as Collider;
    const r = c.kind === 'circle' ? c.r : Math.hypot(c.hw, c.hd);
    for (const k of this.cellKeys(c.x, c.z, r)) {
      let arr = this.cells.get(k);
      if (!arr) this.cells.set(k, (arr = []));
      arr.push(c);
    }
    let list = this.byOwner.get(owner);
    if (!list) this.byOwner.set(owner, (list = []));
    list.push(c);
  }

  removeOwner(owner: string) {
    const list = this.byOwner.get(owner);
    if (!list) return;
    for (const c of list) {
      const r = c.kind === 'circle' ? c.r : Math.hypot(c.hw, c.hd);
      for (const k of this.cellKeys(c.x, c.z, r)) {
        const arr = this.cells.get(k);
        if (!arr) continue;
        const i = arr.indexOf(c);
        if (i >= 0) arr.splice(i, 1);
        if (arr.length === 0) this.cells.delete(k);
      }
    }
    this.byOwner.delete(owner);
  }

  /** Obstacles proches d'un point (pour debug ou IA). */
  query(x: number, z: number, radius: number): Collider[] {
    const out = new Set<Collider>();
    for (const k of this.cellKeys(x, z, radius)) this.cells.get(k)?.forEach((c) => out.add(c));
    return [...out];
  }

  /**
   * Repousse un cercle (x, z, r) hors de tous les obstacles.
   * Retourne la position corrigée. Appelé à chaque frame par les entités.
   */
  resolve(x: number, z: number, r: number): { x: number; z: number; hit: boolean } {
    let hit = false;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const c of this.query(x, z, r)) {
        const p = c.kind === 'circle' ? pushCircle(x, z, r, c) : pushBox(x, z, r, c);
        if (p) {
          x = p.x;
          z = p.z;
          moved = hit = true;
        }
      }
      if (!moved) break;
    }
    return { x, z, hit };
  }

  /** Vrai si le point est à l'intérieur d'un obstacle (avec marge r). */
  blocked(x: number, z: number, r: number, exceptOwner?: string) {
    for (const c of this.query(x, z, r)) {
      if (exceptOwner && c.owner === exceptOwner) continue;
      if (c.kind === 'circle' ? pushCircle(x, z, r, c) : pushBox(x, z, r, c)) return true;
    }
    return false;
  }

  private *cellKeys(x: number, z: number, r: number) {
    const i0 = Math.floor((x - r) / CELL);
    const i1 = Math.floor((x + r) / CELL);
    const j0 = Math.floor((z - r) / CELL);
    const j1 = Math.floor((z + r) / CELL);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) yield (i * 92837111) ^ (j * 689287499);
  }
}

function pushCircle(x: number, z: number, r: number, c: { x: number; z: number; r: number }) {
  const dx = x - c.x;
  const dz = z - c.z;
  const d = Math.hypot(dx, dz);
  const min = r + c.r;
  if (d >= min) return null;
  if (d < 1e-5) return { x: c.x + min, z: c.z };
  return { x: c.x + (dx / d) * min, z: c.z + (dz / d) * min };
}

function pushBox(x: number, z: number, r: number, b: { x: number; z: number; hw: number; hd: number; rot: number }) {
  // Passage dans le repère local de la boîte
  const cos = Math.cos(b.rot);
  const sin = Math.sin(b.rot);
  const dx = x - b.x;
  const dz = z - b.z;
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  const cx = Math.max(-b.hw, Math.min(b.hw, lx));
  const cz = Math.max(-b.hd, Math.min(b.hd, lz));
  let ox = lx - cx;
  let oz = lz - cz;
  const d = Math.hypot(ox, oz);
  if (d >= r) return null;
  let nlx: number;
  let nlz: number;
  if (d > 1e-5) {
    nlx = cx + (ox / d) * r;
    nlz = cz + (oz / d) * r;
  } else {
    // Centre à l'intérieur de la boîte : sortir par le côté le plus proche
    const px = b.hw - Math.abs(lx);
    const pz = b.hd - Math.abs(lz);
    if (px < pz) {
      nlx = Math.sign(lx || 1) * (b.hw + r);
      nlz = lz;
    } else {
      nlx = lx;
      nlz = Math.sign(lz || 1) * (b.hd + r);
    }
  }
  // Retour au repère monde
  return { x: b.x + nlx * cos + nlz * sin, z: b.z - nlx * sin + nlz * cos };
}
