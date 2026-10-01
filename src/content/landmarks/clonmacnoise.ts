/**
 * L'église des Nonnes, Clonmacnoise (Offaly) — petite église romane (nef +
 * chœur, sans toit) au portail sculpté à trois voussures, à 500 m du grand
 * monastère dont on aperçoit la tour ronde et une haute croix.
 * (L'id reste 'clonmacnoise' : ne jamais changer un id publié.)
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { roundTower, celticCross, drystoneWall } from '../../models/landmarkKit';

export const clonmacnoise: LandmarkDef = {
  id: 'clonmacnoise',
  name: 'Église des Nonnes (Clonmacnoise)',
  county: 'Offaly',
  province: 'Leinster',
  category: 'patrimoine',
  tier: 'principal',
  lat: 53.3284,
  lon: -7.9782,
  rotationDeg: 240, // +Z : portail ouest, vers le Shannon
  description: 'La petite église romane des nonnes, à l’écart du grand monastère de Clonmacnoise, sur une boucle du Shannon.',
  funFact: 'Elle a été achevée en 1167 grâce à Derbforgaill, épouse d’un roi de Breifne ; son portail est sculpté de motifs végétaux, géométriques… et de visages grotesques.',
  status: 'done',
  photo: { focus: [0, 2.8, 2], radius: 6, minDistance: 6, maxDistance: 160, bestHours: [18, 20.5] },
  clearRadius: 30,
  terrain: [{ kind: 'flatten', radius: 6, blend: 4 }],
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 3.4, hd: 5, rot: 0 },
    { kind: 'box', x: 0, z: -6.8, hw: 2.2, hd: 2, rot: 0 },
    { kind: 'circle', x: -16, z: -14, r: 1.6 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    // Nef (axe long = Z, portail côté +Z) : murs sans toit
    const L = 10;
    const Wd = 6.4;
    const H = 4.2;
    for (const s of [-1, 1]) b.box(0.7, H, L, 'stone', { x: s * (Wd / 2), z: 0 });
    // Façade ouest : mur percé + portail à trois voussures (arcs emboîtés)
    b.arch(Wd + 0.7, H, 0.8, 2.6, 3.2, 'stone', { z: L / 2 });
    b.roof(Wd + 0.7, 1.6, 0.8, 'stone', { y: H, z: L / 2 });
    for (let k = 0; k < 3; k++) b.arch(2.6 + k * 0.7 + 0.6, 3.6 + k * 0.35, 0.3, 2.6 + k * 0.7, 3.2 + k * 0.35, k % 2 ? 'limestone' : 'sand', { z: L / 2 + 0.4 + k * 0.25 });
    // Petites têtes sculptées autour du portail
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (i / 6);
      b.sphere(0.18, 'limestone', { x: Math.cos(a) * 2.1, y: 2.6 + Math.sin(a) * 2.1, z: L / 2 + 1.15 }, 0);
    }
    // Chœur plus étroit, avec arc triomphal
    b.arch(Wd + 0.7, H, 0.8, 2.4, 3, 'stone', { z: -L / 2 });
    for (const s of [-1, 1]) b.box(0.6, H - 0.6, 4, 'stone', { x: s * 2, z: -L / 2 - 2 });
    b.box(4.6, H - 0.6, 0.6, 'stone', { z: -L / 2 - 4 });
    // Herbe dans la nef, quelques tombes
    b.box(Wd - 0.6, 0.06, L - 0.6, 'grassLight', { y: 0.01 });
    for (let i = 0; i < 6; i++) b.box(0.55, 0.8, 0.14, 'stoneDark', { x: 6 + (i % 3) * 1.5, z: -2 + Math.floor(i / 3) * 2.2, rz: (i % 2 ? 1 : -1) * 0.07 });
    // Le grand monastère au loin : tour ronde (O'Rourke) + haute croix
    roundTower(b, { x: -16, z: -14, y: ctx.groundAt(-16, -14), height: 13, radius: 1.3 });
    celticCross(b, { x: -11, z: -10, y: ctx.groundAt(-11, -10), height: 3.6, ry: 0.6 });
    drystoneWall(b, ctx, -8, 9, 8, 9);
    return b.mesh();
  },
};
