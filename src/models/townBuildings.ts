/**
 * Bâtiments spéciaux des villes : ÉGLISE et PUB (les maisons ordinaires sont
 * dans world/Towns.ts). Chaque modèle est une géométrie unique réutilisée par
 * instancing dans toutes les villes : quelques draw calls pour toute l'Irlande.
 *
 * Repère : façade (porte) vers +Z, origine au sol au centre de l'emprise.
 * Pour modifier l'allure : change les formes ici, puis vérifie en jeu dans une ville.
 */
import * as THREE from 'three';
import { ModelBuilder, ColorRef } from './ModelBuilder';

/** Emprise au sol (demi-largeur, demi-profondeur) pour les collisions et le placement. */
export const CHURCH_SIZE = { hw: 3.4, hd: 8.2 };
export const PUB_SIZE = { hw: 3.7, hd: 2.9 };

/**
 * Église de bourg : nef à pignon, clocher carré à flèche d'ardoise à l'arrière,
 * fenêtres en lancette, croix, quelques tombes sur le côté.
 * @param walls 'stone' (pierre grise) ou 'whitewash' (église crépie, fréquente à la campagne)
 */
export function buildChurchGeometry(walls: ColorRef): THREE.BufferGeometry {
  const b = new ModelBuilder();
  const W = 6;
  const L = 11;
  const H = 5;
  // Nef + toit
  b.box(W, H, L, walls, { z: 1 });
  b.roof(L, 3.2, W + 0.5, 'slate', { y: H, z: 1, ry: Math.PI / 2 });
  // Pignon de façade : porte en ogive, rosace, croix au sommet
  b.box(1.5, 2.6, 0.12, 'woodDark', { z: 1 + L / 2 + 0.02 });
  b.cone(0.75, 0.8, 'woodDark', { y: 2.6, z: 1 + L / 2 + 0.02, sz: 0.15 }, 4);
  b.cylinder(0.7, 0.7, 0.1, 'window', { y: 4.2, z: 1 + L / 2 + 0.02, rx: Math.PI / 2 }, 10);
  b.box(0.18, 1.2, 0.18, 'stoneLight', { y: H + 3.1, z: 1 + L / 2 - 0.2 });
  b.box(0.7, 0.18, 0.18, 'stoneLight', { y: H + 3.6, z: 1 + L / 2 - 0.2 });
  // Fenêtres en lancette sur les côtés
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    b.box(0.12, 2.2, 0.8, 'window', { x: s * (W / 2 + 0.02), y: 1.4, z: -2.5 + i * 3.4 });
    b.cone(0.4, 0.6, 'window', { x: s * (W / 2 + 0.02), y: 3.6, z: -2.5 + i * 3.4, sx: 0.15 }, 4);
  }
  // Clocher à l'arrière + flèche
  b.box(3.4, 11, 3.4, walls, { z: 1 - L / 2 - 1.5 });
  b.box(3.6, 0.3, 3.6, 'stoneLight', { y: 11, z: 1 - L / 2 - 1.5 });
  for (const s of [-1, 1]) b.box(0.1, 1.4, 0.9, 'black', { x: s * 1.72, y: 8.6, z: 1 - L / 2 - 1.5 }); // abat-sons
  b.cone(2.3, 6, 'slate', { y: 11.3, z: 1 - L / 2 - 1.5 }, 4);
  b.box(0.12, 1, 0.12, 'gold', { y: 17.2, z: 1 - L / 2 - 1.5 });
  // Quelques tombes dans l'herbe, côté droit
  for (let i = 0; i < 6; i++) b.box(0.5, 0.75 + (i % 3) * 0.15, 0.12, 'stoneDark', { x: W / 2 + 1.4 + (i % 2) * 1.2, z: -3 + Math.floor(i / 2) * 2.4, rz: (i % 2 ? 1 : -1) * 0.07 });
  return b.build();
}

/**
 * Pub irlandais : maison à étage. Deux géométries :
 *  - `shell` : la maison, en BLANC → teintée par instance (couleur de façade)
 *  - `front` : devanture sombre, enseigne dorée, vitrines, toit, cheminée (couleurs fixes)
 */
export function buildPubGeometries(): { shell: THREE.BufferGeometry; front: THREE.BufferGeometry } {
  const W = 7;
  const D = 5.4;
  const H = 6;
  const s = new ModelBuilder();
  s.box(W, H, D, 'white');
  const shell = s.build();

  const f = new ModelBuilder();
  const z = D / 2 + 0.03;
  // Devanture sombre au rez-de-chaussée + bandeau d'enseigne doré
  f.box(W + 0.1, 2.9, 0.14, 'black', { z });
  f.box(W - 0.6, 0.6, 0.16, 'gold', { y: 2.35, z: z + 0.02 });
  f.box(W - 1.0, 0.36, 0.17, 'black', { y: 2.47, z: z + 0.03 }); // "lettres"
  f.box(2.2, 1.5, 0.16, 'glass', { x: -2.1, y: 0.7, z: z + 0.02 });
  f.box(2.2, 1.5, 0.16, 'glass', { x: 2.1, y: 0.7, z: z + 0.02 });
  f.box(1.1, 2.1, 0.16, 'door', { z: z + 0.02 });
  // Fenêtres de l'étage (encadrées de blanc)
  for (const x of [-2.2, 0, 2.2]) {
    f.box(1.1, 1.3, 0.1, 'whitewash', { x, y: 3.6, z });
    f.box(0.9, 1.1, 0.12, 'window', { x, y: 3.7, z });
  }
  // Enseigne suspendue en drapeau + jardinières fleuries
  f.box(0.08, 0.08, 1.2, 'black', { x: W / 2 - 0.4, y: 3.1, z: z + 0.6 });
  f.box(0.08, 0.9, 0.9, 'gold', { x: W / 2 - 0.4, y: 2.2, z: z + 0.8 });
  for (const x of [-2.1, 2.1]) {
    f.box(2.0, 0.3, 0.35, 'wood', { x, y: 1.5, z: z + 0.2 });
    f.sphere(0.25, 'facadeA', { x: x - 0.5, y: 1.85, z: z + 0.25 }, 0);
    f.sphere(0.25, 'facadeC', { x: x + 0.4, y: 1.85, z: z + 0.25 }, 0);
  }
  // Tonneaux devant la porte
  for (const x of [-0.9, 0.9]) f.cylinder(0.35, 0.35, 0.8, 'woodDark', { x, z: z + 0.6 }, 8);
  // Toit d'ardoise + cheminées
  f.roof(W + 0.4, 2.0, D + 0.6, 'slate', { y: H });
  for (const x of [-W / 2 + 0.6, W / 2 - 0.6]) f.box(0.7, 1.6, 0.9, 'stoneDark', { x, y: H + 0.4 });
  return { shell, front: f.build() };
}
