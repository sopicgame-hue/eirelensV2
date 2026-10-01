/**
 * Belfast City Hall — hôtel de ville baroque en pierre de Portland (1906) :
 * grand bâtiment carré à tours d'angle, dôme de cuivre vert au centre,
 * portique à colonnes côté +Z (nord, Donegall Place), pelouse et mémorial du Titanic.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const W = 24; // largeur (X)
const D = 20; // profondeur (Z)
const H = 8; // hauteur des façades

export const belfastCityHall: LandmarkDef = {
  id: 'belfast_city_hall',
  name: 'Hôtel de ville de Belfast',
  county: 'Antrim',
  province: 'Ulster',
  category: 'ville',
  tier: 'secondaire',
  // Position réelle : 54.5964, -5.9300 = pile au carrefour où le jeu fait converger
  // toutes les routes de Belfast. Décalé d'~50 u à l'est (bord de la ville, au sud
  // du Titanic) pour ne pas poser le bâtiment sur les routes.
  lat: 54.5844,
  lon: -5.8786,
  rotationDeg: 180, // +Z : façade principale au nord
  description: 'L’hôtel de ville de Belfast, inauguré en 1906, en pierre de Portland blanche, coiffé d’un grand dôme de cuivre vert.',
  funFact: 'Son dôme culmine à 53 m. Dans ses jardins se dresse le mémorial du Titanic, inauguré en 1920 en hommage aux victimes du naufrage.',
  status: 'done',
  photo: { focus: [0, 9, 0], radius: 13, minDistance: 16, maxDistance: 300, bestHours: [8, 10] },
  clearRadius: 26,
  terrain: [{ kind: 'flatten', radius: 22, blend: 8 }],
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: W / 2 + 2, hd: D / 2 + 2, rot: 0 },
    { kind: 'box', x: 0, z: D / 2 + 2.5, hw: 6.3, hd: 2, rot: 0 },
    { kind: 'circle', x: -9, z: D / 2 + 8, r: 1.2 },
  ],

  build() {
    const b = new ModelBuilder();
    // Corps principal + corniche + toits de cuivre
    b.box(W, H, D, 'quartz');
    b.box(W + 0.4, 0.5, D + 0.4, 'stoneLight', { y: H });
    b.box(W - 2, 1.8, D - 2, 'copperGreen', { y: H + 0.5 });
    // Rangées de fenêtres sur les 4 faces
    for (let i = -5; i <= 5; i++)
      for (const y of [1.4, 4.8])
        for (const s of [-1, 1]) {
          b.box(1.1, 1.9, 0.12, 'window', { x: i * 2.2, y, z: s * (D / 2 + 0.02) });
          if (Math.abs(i) <= 3) b.box(0.12, 1.9, 1.1, 'window', { x: s * (W / 2 + 0.02), y, z: i * 2.2 });
        }
    // Tours d'angle à petits dômes verts
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = (sx * W) / 2;
        const z = (sz * D) / 2;
        b.box(4, H + 3.5, 4, 'quartz', { x, z });
        b.box(4.4, 0.4, 4.4, 'stoneLight', { x, z, y: H + 3.5 });
        b.cylinder(1.3, 1.5, 1.6, 'quartz', { x, z, y: H + 3.9 }, 10);
        b.sphere(1.5, 'copperGreen', { x, z, y: H + 5.5, sy: 1.2 }, 1);
        b.box(0.15, 1, 0.15, 'gold', { x, z, y: H + 7.2 });
      }
    // Grand dôme central : tambour à colonnes, dôme vert, lanterne, boule dorée
    b.cylinder(4.6, 4.8, 4, 'quartz', { y: H + 0.8 }, 18);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.cylinder(0.26, 0.26, 4, 'stoneLight', { x: Math.cos(a) * 4.95, z: Math.sin(a) * 4.95, y: H + 0.8 }, 6);
    }
    b.cylinder(5.2, 5.2, 0.4, 'stoneLight', { y: H + 4.8 }, 18);
    b.sphere(4.8, 'copperGreen', { y: H + 5.2, sy: 1.15 }, 2);
    b.cylinder(1, 1.2, 2.2, 'quartz', { y: H + 10.2 }, 10);
    b.sphere(1.1, 'copperGreen', { y: H + 12.4, sy: 1.1 }, 1);
    b.sphere(0.3, 'gold', { y: H + 13.8 }, 0);
    // Portique d'entrée (côté +Z) : 6 colonnes + fronton
    for (let i = 0; i < 6; i++) b.cylinder(0.42, 0.48, 6.5, 'quartz', { x: -5 + i * 2, z: D / 2 + 3 }, 8);
    b.box(12.5, 0.9, 4, 'stoneLight', { z: D / 2 + 2, y: 6.5 });
    b.roof(12.5, 2, 4, 'quartz', { z: D / 2 + 2, y: 7.4 });
    b.box(4, 0.5, 2.5, 'stoneLight', { z: D / 2 + 4.6 }); // marches
    // Pelouse, allée, mémorial du Titanic (figure sur un socle, deux sirènes au pied)
    b.box(W + 8, 0.06, 8, 'grassLight', { z: D / 2 + 9, y: 0.01 });
    b.box(3, 0.08, 8, 'stoneLight', { z: D / 2 + 9, y: 0.02 });
    b.box(2, 2, 2, 'stoneLight', { x: -9, z: D / 2 + 8 });
    b.cylinder(0.32, 0.5, 2, 'stoneLight', { x: -9, z: D / 2 + 8, y: 2 }, 8);
    b.sphere(0.32, 'stoneLight', { x: -9, z: D / 2 + 8, y: 4.3 }, 0);
    for (const s of [-1, 1]) b.sphere(0.45, 'stone', { x: -9 + s * 1.3, z: D / 2 + 8, y: 0.45, sy: 0.8 }, 0);
    return b.mesh();
  },
};
