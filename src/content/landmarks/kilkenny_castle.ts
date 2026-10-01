/**
 * Château de Kilkenny — trois ailes crénelées en U autour d'une cour ouverte
 * sur le parc (côté +Z), trois grosses tours rondes aux angles, pelouse et
 * roseraie au premier plan.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const W = 26; // aile du fond (axe X)
const D = 18; // ailes latérales (axe Z)
const H = 8;

export const kilkennyCastle: LandmarkDef = {
  id: 'kilkenny_castle',
  name: 'Château de Kilkenny',
  county: 'Kilkenny',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'secondaire',
  lat: 52.6505,
  lon: -7.249,
  rotationDeg: 0,
  description: 'Un château normand transformé au fil des siècles en résidence d’apparat, au bord de la rivière Nore.',
  funFact: 'La puissante famille Butler y a vécu près de 600 ans, puis l’a vendu en 1967 à la ville de Kilkenny… pour 50 livres.',
  status: 'done',
  photo: { focus: [0, 6, -4], radius: 14, minDistance: 16, maxDistance: 260, bestHours: [7, 9] },
  clearRadius: 26,
  terrain: [{ kind: 'flatten', radius: 22, blend: 10 }],
  colliders: [
    { kind: 'box', x: 0, z: -D / 2, hw: W / 2 + 2, hd: 3, rot: 0 },
    { kind: 'box', x: -W / 2, z: 0, hw: 3, hd: D / 2 + 2, rot: 0 },
    { kind: 'box', x: W / 2, z: 0, hw: 3, hd: D / 2 + 2, rot: 0 },
  ],

  build() {
    const b = new ModelBuilder();
    // Trois ailes : fond + deux côtés
    const wings: [number, number, number, number][] = [
      [0, -D / 2, W, 5],
      [-W / 2, 0, 5, D],
      [W / 2, 0, 5, D],
    ];
    for (const [x, z, w, d] of wings) {
      b.box(w, H, d, 'stoneLight', { x, z });
      b.box(w + 0.3, 0.3, d + 0.3, 'stone', { x, z, y: H - 0.3 });
      b.crenellations(w + 0.3, d + 0.3, 'stoneLight', { x, z, y: H }, 0.6);
      // Faîtage dans le sens de la longueur de l'aile
      b.roof(Math.max(w, d) - 1, 1.6, Math.min(w, d) - 1, 'slate', { x, z, y: H - 0.2, ry: w > d ? 0 : Math.PI / 2 });
    }
    // Rangées de fenêtres côté cour et côté parc
    for (let i = -5; i <= 5; i++) for (const y of [2, 5]) b.box(0.9, 1.5, 0.12, 'window', { x: i * 2.1, y, z: -D / 2 + 2.56 });
    for (const s of [-1, 1]) for (let i = -3; i <= 3; i++) for (const y of [2, 5]) b.box(0.12, 1.5, 0.9, 'window', { x: s * (W / 2 - 2.56), y, z: i * 2.1 });
    // Tours rondes : deux au fond, une à l'avant gauche (la 4e a disparu au XVIIe siècle)
    for (const [x, z] of [
      [-W / 2, -D / 2],
      [W / 2, -D / 2],
      [-W / 2, D / 2],
    ]) {
      b.cylinder(3.4, 3.6, H + 4, 'stoneLight', { x, z }, 14);
      b.cylinder(3.6, 3.6, 0.4, 'stone', { x, z, y: H + 4 }, 14);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.box(0.65, 0.7, 0.65, 'stoneLight', { x: x + Math.cos(a) * 3.3, z: z + Math.sin(a) * 3.3, y: H + 4.3 });
      }
      b.cone(3, 3, 'slate', { x, z, y: H + 4.2 }, 14);
    }
    // Portail d'honneur (aile du fond, vers la cour)
    b.box(3, 4, 0.3, 'stone', { z: -D / 2 + 2.7 });
    b.box(2.2, 3.2, 0.32, 'woodDark', { z: -D / 2 + 2.75 });
    // Pelouse + allées + roseraie en demi-cercle devant
    b.box(W + 10, 0.08, 16, 'grassLight', { z: D / 2 + 7, y: 0.01 });
    b.box(2.5, 0.1, 16, 'sand', { z: D / 2 + 7, y: 0.02 });
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * (i / 11);
      const x = Math.cos(a) * 8;
      const z = D / 2 + 9 + Math.sin(a) * 4;
      b.sphere(0.6, 'leaf', { x, z, y: 0.5 }, 0);
      b.sphere(0.25, i % 2 ? 'facadeA' : 'pink', { x, z: z + 0.3, y: 0.9 }, 0);
    }
    return b.mesh();
  },
};
