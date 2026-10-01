/**
 * Rocher de Cashel (Tipperary) — ensemble médiéval sur un plateau calcaire.
 * Repère local : origine = centre du plateau. Le plateau est créé par un
 * tampon "mesa" (le relief naturel de la plaine est presque plat ici).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

export const rockOfCashel: LandmarkDef = {
  id: 'rock_of_cashel',
  name: 'Rocher de Cashel',
  county: 'Tipperary',
  province: 'Munster',
  category: 'patrimoine',
  lat: 52.52,
  lon: -7.8906,
  rotationDeg: 10,
  description: 'Un ensemble médiéval perché sur un piton calcaire : cathédrale, tour ronde et chapelle.',
  funFact: 'Selon la tradition, saint Patrick y aurait converti le roi de Munster au Ve siècle.',
  status: 'done',
  photo: { focus: [0, 7, 0], radius: 14, minDistance: 18, maxDistance: 380 },
  clearRadius: 34,
  terrain: [{ kind: 'mesa', radius: 21, height: 12, blend: 11 }],
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 8.5, hd: 3.3, rot: 0 },
    { kind: 'box', x: 1, z: 0, hw: 3.2, hd: 7.5, rot: 0 },
    { kind: 'circle', x: -9, z: -6, r: 1.4 },
    { kind: 'box', x: 7, z: 8, hw: 3.6, hd: 2.2, rot: 0 },
    { kind: 'box', x: -9, z: 9, hw: 5, hd: 2, rot: 0 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    const wall = (x: number, z: number, w: number, d: number, h: number) => b.box(w, h, d, 'stone', { x, z, y: -0.3 });

    // --- Cathédrale sans toit : nef (axe X) + transept (axe Z) + tour de croisée
    const H = 7.5;
    wall(0, -3.2, 17, 0.6, H);
    wall(0, 3.2, 17, 0.6, H);
    wall(-8.5, 0, 0.6, 7, H);
    wall(8.5, 0, 0.6, 7, H);
    wall(-2, -7.5, 6.6, 0.6, H);
    wall(-2 + 3.2, -5.3, 0.6, 4.4, H);
    wall(-2 - 3.2, -5.3, 0.6, 4.4, H);
    wall(-2, 7.5, 6.6, 0.6, H);
    wall(-2 + 3.2, 5.3, 0.6, 4.4, H);
    wall(-2 - 3.2, 5.3, 0.6, 4.4, H);
    // Pignons (triangles de pierre) aux extrémités
    // roof(w, h, d) : faîtage le long de X → triangle dans le plan YZ (base = d)
    b.roof(0.6, 3, 7, 'stone', { x: -8.5, y: H - 0.3 });
    b.roof(0.6, 3, 7, 'stone', { x: 8.5, y: H - 0.3 });
    b.roof(0.6, 3, 6.6, 'stone', { x: -2, y: H - 0.3, z: -7.5, ry: Math.PI / 2 });
    b.roof(0.6, 3, 6.6, 'stone', { x: -2, y: H - 0.3, z: 7.5, ry: Math.PI / 2 });
    // Fenêtres en lancette
    for (const x of [-6, -3.5, 3.5, 6]) {
      b.box(0.5, 2.2, 0.7, 'window', { x, y: 3.2, z: -3.2 });
      b.box(0.5, 2.2, 0.7, 'window', { x, y: 3.2, z: 3.2 });
    }
    b.box(1.6, 3.2, 0.7, 'window', { x: 8.55, y: 2.6, ry: Math.PI / 2 });
    // Tour de croisée crénelée
    b.box(4.2, 12, 4.2, 'stoneLight', { x: -2, y: -0.3 });
    b.crenellations(4.4, 4.4, 'stoneLight', { x: -2, y: 11.7 });

    // --- Tour ronde (28 m réels) avec toit conique
    b.cylinder(1.05, 1.25, 15, 'stoneLight', { x: -9, z: -6, y: -0.3 }, 10);
    b.cone(1.2, 2.8, 'stoneDark', { x: -9, z: -6, y: 14.7 }, 10);
    b.box(0.5, 1.1, 0.3, 'woodDark', { x: -9, z: -4.85, y: 4 });

    // --- Chapelle de Cormac : toit de pierre très pentu + deux tours carrées
    b.box(7, 4.2, 4.2, 'stoneDark', { x: 7, z: 8, y: -0.3 });
    b.roof(7.2, 3.6, 4.6, 'stoneDark', { x: 7, z: 8, y: 3.9 });
    b.box(1.6, 8.5, 1.6, 'stoneDark', { x: 3.6, z: 6.2, y: -0.3 });
    b.box(1.6, 8.5, 1.6, 'stoneDark', { x: 3.6, z: 9.8, y: -0.3 });
    b.cone(1.15, 1.6, 'stoneDark', { x: 3.6, z: 6.2, y: 8.2 }, 4);
    b.arch(1.8, 2.4, 0.5, 1, 1.8, 'stone', { x: 10.6, z: 8, y: -0.3, ry: Math.PI / 2 });

    // --- Hall des Vicaires (toit d'ardoise)
    b.box(10, 3.2, 4, 'whitewash', { x: -9, z: 9, y: -0.3 });
    b.roof(10.2, 2, 4.4, 'slate', { x: -9, z: 9, y: 2.9 });

    // --- Croix celtique
    b.box(0.5, 3.4, 0.35, 'stoneLight', { x: 2, z: 12, y: -0.3 });
    b.box(2, 0.45, 0.35, 'stoneLight', { x: 2, z: 12, y: 2.2 });

    // --- Mur d'enceinte au bord du plateau (suit le sol)
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const x = Math.cos(a) * 18.5;
      const z = Math.sin(a) * 18.5;
      if (i >= 9 && i <= 11) continue; // entrée au sud-est
      b.box(3.1, 1.3, 0.6, 'stone', { x, z, y: ctx.groundAt(x, z) - 0.4, ry: -a + Math.PI / 2 });
    }
    return b.mesh();
  },
};
