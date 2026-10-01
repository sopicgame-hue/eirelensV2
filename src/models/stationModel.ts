/**
 * Gare de campagne irlandaise : bâtiment en pierre, quai, voie ferrée et
 * un petit train vert et crème à quai. Une gare par zone (world/data/zones.ts).
 *
 * Repère local : bâtiment au centre, QUAI et VOIE côté +Z (la voie suit l'axe X),
 * entrée côté rue en −Z (c'est là que le joueur arrive).
 */
import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder';
import { sharedMaterials } from './materials';

export const STATION_LAYOUT = {
  /** Point d'arrivée du joueur (local), devant l'entrée côté rue. */
  arrival: { x: 0, z: -6.5 },
  /** Obstacles (local) : bâtiment + train à quai. */
  colliders: [
    { kind: 'box' as const, x: 0, z: 0, hw: 5, hd: 2.8, rot: 0 },
    { kind: 'box' as const, x: 2, z: 7.4, hw: 9.5, hd: 1.5, rot: 0 },
  ],
};

export function buildStation(): THREE.Object3D {
  const root = new THREE.Group();
  const b = new ModelBuilder();

  // --- Bâtiment principal (pierre claire, toit d'ardoise, cheminées)
  b.box(10, 4.2, 5.4, 'stoneLight', { z: 0 });
  b.roof(10.6, 2.2, 6.0, 'slate', { y: 4.2 });
  for (const x of [-3.2, 3.2]) b.box(0.7, 1.6, 0.7, 'stone', { x, y: 5.2 });
  // Portes et fenêtres vertes encadrées de blanc (côté rue et côté quai)
  for (const side of [-1, 1]) {
    const z = side * 2.72;
    b.box(1.3, 2.4, 0.1, 'trainGreen', { z });
    b.box(1.6, 0.2, 0.12, 'whitewash', { y: 2.4, z });
    for (const x of [-3.2, -1.8, 1.8, 3.2]) {
      b.box(0.9, 1.3, 0.1, 'whitewash', { x, y: 1.2, z: z + side * 0.01 });
      b.box(0.7, 1.1, 0.12, 'window', { x, y: 1.3, z: z + side * 0.02 });
    }
  }
  // Auvent sur le quai (poteaux + toit)
  b.box(14, 0.25, 3.6, 'slate', { y: 3.6, z: 4.4, rx: -0.12 });
  for (const x of [-6, -2, 2, 6]) b.box(0.25, 3.7, 0.25, 'trainGreen', { x, z: 5.9 });

  // --- Quai
  b.box(26, 0.22, 4.2, 'stoneLight', { z: 4.4 });
  b.box(26, 0.24, 0.3, 'signYellow', { z: 6.35 }); // ligne de sécurité
  // Bancs + tonneaux de fleurs
  for (const x of [-9, 8.5]) {
    b.box(1.8, 0.12, 0.5, 'wood', { x, y: 0.62, z: 3.3 });
    b.box(1.8, 0.5, 0.1, 'wood', { x, y: 0.75, z: 3.05 });
    b.box(0.12, 0.62, 0.45, 'black', { x: x - 0.8, z: 3.3 });
    b.box(0.12, 0.62, 0.45, 'black', { x: x + 0.8, z: 3.3 });
  }
  for (const [x, c] of [
    [-11.5, 'facadeA'],
    [-4.5, 'facadeC'],
    [11.5, 'facadeE'],
  ] as const) {
    b.cylinder(0.5, 0.45, 0.7, 'wood', { x, z: 2.8 }, 8);
    b.sphere(0.55, 'leaf', { x, y: 1.0, z: 2.8 }, 0);
    b.sphere(0.25, c, { x: x + 0.2, y: 1.3, z: 2.95 }, 0);
  }
  // Panneau de gare (vert, liseré crème)
  for (const x of [-8.6, -5.4]) b.box(0.15, 2.6, 0.15, 'black', { x, z: 5.6 });
  b.box(3.6, 0.9, 0.12, 'trainGreen', { x: -7, y: 2.3, z: 5.6 });
  b.box(3.2, 0.12, 0.14, 'trainCream', { x: -7, y: 2.55, z: 5.6 });
  b.box(3.2, 0.12, 0.14, 'trainCream', { x: -7, y: 2.35, z: 5.6 });

  // --- Voie ferrée (traverses + rails) le long de X
  for (let x = -24; x <= 24; x += 1.3) b.box(0.35, 0.14, 2.4, 'woodDark', { x, z: 7.4 });
  for (const s of [-1, 1]) b.box(50, 0.16, 0.12, 'rail', { y: 0.14, z: 7.4 + s * 0.72 });

  // --- Train à quai : locomotive + voiture, vert et crème
  b.push({ x: 2, z: 7.4, y: 0.3 });
  b.box(13, 2.2, 2.7, 'trainGreen', { x: -2.6, y: 0.5 }); // voiture
  b.box(13.05, 0.45, 2.75, 'trainCream', { x: -2.6, y: 1.55 }); // bande crème
  for (let x = -8; x <= 2.6; x += 1.8) b.box(1.2, 0.7, 2.78, 'window', { x, y: 1.6 });
  b.box(13, 0.35, 2.4, 'slate', { x: -2.6, y: 2.7 });
  b.box(5, 2.5, 2.7, 'signYellow', { x: 6.6, y: 0.5 }); // locomotive (avant jaune)
  b.box(5, 0.35, 2.4, 'slate', { x: 6.6, y: 3.0 });
  b.box(0.2, 0.9, 2.2, 'window', { x: 9.05, y: 1.9, rz: 0.15 });
  for (let x = -8; x <= 8; x += 4) for (const s of [-1, 1]) b.cylinder(0.45, 0.45, 0.2, 'black', { x, y: 0.05, z: s * 1.25, rx: Math.PI / 2 }, 8);
  b.pop();
  root.add(b.mesh());

  // --- Lampadaire allumé (matériau "glow" : brille la nuit)
  const lamp = new ModelBuilder();
  lamp.cylinder(0.08, 0.1, 3.4, 'black', { x: 12.5, z: 5.5 }, 6);
  root.add(lamp.mesh());
  const glow = new ModelBuilder();
  glow.box(0.4, 0.5, 0.4, 'white', { x: 12.5, y: 3.4, z: 5.5 });
  root.add(glow.mesh(sharedMaterials().glow));

  return root;
}
