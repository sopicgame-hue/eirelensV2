/**
 * Cathédrale St Fin Barre's (Cork) — néogothique de William Burges : façade
 * ouest (+Z) à deux tours à flèche et grande rose, flèche centrale plus haute
 * à la croisée, transept, abside à l'est (−Z) surmontée de l'ange doré.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const NW = 10; // largeur de la nef
const NL = 24; // longueur de la nef
const NH = 9; // hauteur des murs

export const stFinBarres: LandmarkDef = {
  id: 'st_fin_barres',
  name: 'Cathédrale St Fin Barre’s',
  county: 'Cork',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Position réelle : 51.8944, -8.4806, sur le trajet des routes qui convergent au
  // centre de Cork. Décalé d'~30 u au nord pour dégager les routes.
  lat: 51.9117,
  lon: -8.494,
  rotationDeg: -90, // +Z : façade ouest
  description: 'La cathédrale aux trois flèches de Cork, chef-d’œuvre néogothique de William Burges consacré en 1870, là où saint Finbarr aurait fondé la ville.',
  funFact: 'Un ange doré veille sur le toit du chœur : la légende dit que s’il tombe, ce sera la fin du monde. Un boulet de canon du siège de 1690, retrouvé dans l’ancien clocher, est exposé à l’intérieur.',
  status: 'done',
  photo: { focus: [0, 13, 2], radius: 16, minDistance: 18, maxDistance: 320, bestHours: [18.5, 20.5] },
  clearRadius: 26,
  terrain: [{ kind: 'flatten', radius: 22, blend: 8 }],
  colliders: [
    { kind: 'box', x: 0, z: 1, hw: NW / 2 + 0.5, hd: NL / 2 + 3, rot: 0 },
    { kind: 'box', x: 0, z: -7, hw: 9.5, hd: 3, rot: 0 },
  ],

  build() {
    const b = new ModelBuilder();
    const zW = NL / 2 + 1; // façade ouest
    // Nef + toit pentu + contreforts
    b.box(NW, NH, NL, 'limestone', { z: 1 });
    b.roof(NL, 5, NW + 0.6, 'slate', { y: NH, z: 1, ry: Math.PI / 2 });
    for (let i = -4; i <= 4; i++)
      for (const s of [-1, 1]) {
        b.box(0.8, NH - 1, 1.2, 'stone', { x: s * (NW / 2 + 0.4), z: 1 + i * 2.6 });
        if (i < 4) b.box(0.12, 4, 0.9, 'window', { x: s * (NW / 2 + 0.02), y: 3, z: 2.3 + i * 2.6 });
      }
    // Transept
    b.box(19, NH, 6, 'limestone', { z: -7 });
    b.roof(19, 5, 6.6, 'slate', { y: NH, z: -7 });
    for (const s of [-1, 1]) b.cylinder(1.4, 1.4, 0.15, 'window', { x: s * 9.52, y: 5.5, z: -7, rz: Math.PI / 2 }, 10);
    // Abside à l'est + ange doré au faîte
    b.cylinder(NW / 2, NW / 2, NH, 'limestone', { z: -NL / 2 + 1 }, 10);
    b.cone(NW / 2 + 0.3, 5, 'slate', { z: -NL / 2 + 1, y: NH }, 10);
    b.box(0.5, 1.4, 0.3, 'gold', { z: -NL / 2 + 1, y: NH + 5 });
    b.box(1.6, 0.25, 0.2, 'gold', { z: -NL / 2 + 1, y: NH + 5.8 }); // ailes
    b.sphere(0.25, 'gold', { z: -NL / 2 + 1, y: NH + 6.6 }, 0);
    // Façade ouest : deux tours à flèche, grande rose, portail à voussures
    for (const s of [-1, 1]) {
      b.box(4.4, 18, 4.4, 'limestone', { x: s * 5.6, z: zW });
      for (const y of [8, 12.5]) b.box(1, 2.6, 0.12, 'window', { x: s * 5.6, y, z: zW + 2.22 });
      b.cone(3, 12, 'stone', { x: s * 5.6, z: zW, y: 18 }, 8);
      for (const cx of [-1, 1]) for (const cz of [-1, 1]) b.cone(0.5, 2.4, 'stone', { x: s * 5.6 + cx * 1.9, z: zW + cz * 1.9, y: 18 }, 4);
    }
    b.box(NW - 3, NH + 4, 1.2, 'limestone', { z: zW + 1.2 });
    b.roof(NW - 3, 3, 1.2, 'limestone', { y: NH + 4, z: zW + 1.2 });
    b.cylinder(2.4, 2.4, 0.2, 'window', { y: 9.2, z: zW + 1.85, rx: Math.PI / 2 }, 16);
    b.cylinder(2.7, 2.7, 0.15, 'stoneLight', { y: 9.2, z: zW + 1.8, rx: Math.PI / 2 }, 16);
    for (let k = 0; k < 3; k++) b.arch(3.2 + k * 0.8, 5.4 + k * 0.4, 0.4, 2.4 + k * 0.8, 4.6 + k * 0.4, k % 2 ? 'stoneLight' : 'stone', { z: zW + 1.9 + k * 0.3 });
    b.box(2.2, 3.4, 0.2, 'woodDark', { z: zW + 1.85 });
    // Tour et flèche centrales à la croisée (la plus haute)
    b.box(6, 22, 6, 'limestone', { z: -7 });
    for (const s of [-1, 1]) b.box(0.12, 4, 1.4, 'window', { x: s * 3.02, y: 16, z: -7 });
    b.cone(4.2, 16, 'stone', { z: -7, y: 22 }, 8);
    b.box(0.2, 1.6, 0.2, 'gold', { z: -7, y: 38 });
    // Parvis
    b.box(20, 0.1, 8, 'stoneLight', { z: zW + 6, y: 0.01 });
    return b.mesh();
  },
};
