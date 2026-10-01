/**
 * Château du roi Jean (Limerick) — forteresse normande sur l'île du Roi, au
 * bord du Shannon : courtine crénelée, grosses tours rondes aux angles et
 * châtelet d'entrée à deux tours. Le Shannon est du côté +Z (rotationDeg).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const W = 22; // largeur de l'enceinte (axe X)
const D = 16; // profondeur (axe Z)
const H = 7; // hauteur des murs

export const kingJohnsCastle: LandmarkDef = {
  id: 'king_johns_castle',
  name: 'Château du roi Jean',
  county: 'Limerick',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  lat: 52.6697,
  lon: -8.6258,
  rotationDeg: 215, // +Z vers le Shannon
  description: 'Une forteresse normande du début du XIIIe siècle, plantée sur l’île du Roi au bord du Shannon, au cœur de Limerick.',
  funFact: 'Elle doit son nom au roi Jean d’Angleterre, qui en ordonna la construction ; ses murs portent encore les cicatrices des sièges de 1642 et de 1690-1691.',
  status: 'done',
  photo: { focus: [0, 5, 0], radius: 12, minDistance: 14, maxDistance: 260, bestHours: [18.5, 20.5] },
  clearRadius: 22,
  // Pas de 'flatten' : le Shannon est à 6 u, il serait comblé. (Le sol de Limerick est déjà plat.)
  colliders: [
    { kind: 'box', x: 0, z: -D / 2, hw: W / 2 + 1, hd: 1.2, rot: 0 },
    { kind: 'box', x: 0, z: D / 2, hw: W / 2 + 1, hd: 1.2, rot: 0 },
    { kind: 'box', x: -W / 2, z: 0, hw: 1.2, hd: D / 2, rot: 0 },
    { kind: 'box', x: W / 2, z: 0, hw: 1.2, hd: D / 2, rot: 0 },
    { kind: 'circle', x: -W / 2, z: D / 2, r: 3.4 },
    { kind: 'circle', x: W / 2, z: D / 2, r: 3.4 },
    { kind: 'circle', x: W / 2, z: -D / 2, r: 3.4 },
  ],

  build() {
    const b = new ModelBuilder();
    // Courtine : 4 murs épais + chemin de ronde crénelé
    const walls: [number, number, number, number][] = [
      [0, -D / 2, W, 1.6],
      [0, D / 2, W, 1.6],
      [-W / 2, 0, 1.6, D],
      [W / 2, 0, 1.6, D],
    ];
    for (const [x, z, w, d] of walls) {
      b.box(w, H, d, 'stone', { x, z });
      b.crenellations(w + 0.2, d + 0.2, 'stone', { x, z, y: H }, 0.55);
    }
    // Grosses tours rondes (côté rivière + un angle côté ville)
    for (const [x, z] of [
      [-W / 2, D / 2],
      [W / 2, D / 2],
      [W / 2, -D / 2],
    ]) {
      b.cylinder(3.1, 3.4, H + 3, 'stone', { x, z }, 14);
      b.cylinder(3.3, 3.3, 0.4, 'stoneLight', { x, z, y: H + 3 }, 14);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        b.box(0.6, 0.7, 0.6, 'stone', { x: x + Math.cos(a) * 3, z: z + Math.sin(a) * 3, y: H + 3.35 });
      }
      for (let lv = 1; lv <= 3; lv++) b.box(0.4, 0.9, 0.2, 'window', { x, z: z + (z > 0 ? 3.35 : -3.35), y: lv * 2.7 });
    }
    // Châtelet d'entrée (côté ville, −Z) : deux tours rondes encadrant une porte
    for (const s of [-1, 1]) {
      b.cylinder(2.2, 2.4, H + 2.5, 'stoneLight', { x: -4 + s * 2.6, z: -D / 2 - 1.2 }, 12);
      b.cone(2.5, 2.2, 'slate', { x: -4 + s * 2.6, z: -D / 2 - 1.2, y: H + 2.5 }, 12);
    }
    b.arch(3, 4.5, 2.2, 2, 3.4, 'stoneDark', { x: -4, z: -D / 2 - 0.4 });
    b.box(1.8, 3, 0.2, 'woodDark', { x: -4, z: -D / 2 - 1.55 });
    // Cour : bâtiment intérieur + herbe
    b.box(W - 3, 0.1, D - 3, 'grass', { y: 0.02 });
    b.box(8, 5, 5, 'stoneLight', { x: 3, z: 1 });
    b.roof(8.4, 2.4, 5.6, 'slate', { x: 3, z: 1, y: 5 });
    // Quai le long du Shannon
    b.box(W + 10, 0.4, 3, 'stoneDark', { z: D / 2 + 4, y: -0.3 });
    return b.mesh();
  },
};
