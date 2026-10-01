/**
 * Falaises de Moher (Clare) — MONUMENT DE RÉFÉRENCE (bien commenté, à imiter).
 *
 * Repère local : origine = pied de la tour O'Brien, au sommet de la falaise.
 * rotationDeg = -127 → l'axe local +Z pointe vers la MER (ouest-nord-ouest).
 * Les falaises elles-mêmes sont produites par le relief (CLIFF_ZONES dans
 * world/data/relief.ts) ; ce fichier ajoute la tour, le muret de dalles et
 * l'aiguille rocheuse Branaunmore.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { cliffFace } from '../../models/landmarkKit';

export const cliffsOfMoher: LandmarkDef = {
  id: 'cliffs_of_moher',
  name: 'Falaises de Moher',
  county: 'Clare',
  province: 'Munster',
  category: 'nature',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 52.9708,
  lon: -9.4262,
  rotationDeg: -127,
  description: 'Des falaises de 214 m de haut qui s’étirent sur 8 km face à l’Atlantique.',
  funFact: 'La tour O’Brien a été construite en 1835 comme point de vue pour les visiteurs.',
  status: 'done',
  photo: {
    // Le sujet = la paroi, côté mer (dy relatif au sol en ce point, ici le fond marin)
    focus: [0, 6, 12],
    radius: 18,
    minDistance: 20,
    maxDistance: 450,
    bestHours: [18.5, 21],
  },
  clearRadius: 14,
  terrain: [{ kind: 'flatten', radius: 5, blend: 6 }],
  colliders: [{ kind: 'circle', x: 0, z: 0, r: 2.1 }],

  build(ctx) {
    const b = new ModelBuilder();

    // --- Tour O'Brien : tour ronde crénelée + tourelle d'escalier
    b.cylinder(1.75, 1.95, 5.6, 'stone', {}, 12);
    b.cylinder(2.05, 2.05, 0.45, 'stoneLight', { y: 5.5 }, 12);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (i % 2) b.box(0.55, 0.6, 0.45, 'stone', { x: Math.cos(a) * 1.85, y: 5.95, z: Math.sin(a) * 1.85, ry: -a });
    }
    b.cylinder(0.65, 0.7, 6.9, 'stone', { x: -1.55, z: -0.9 }, 8);
    b.cone(0.75, 0.9, 'slate', { x: -1.55, y: 6.9, z: -0.9 }, 8);
    b.box(0.85, 1.7, 0.25, 'woodDark', { z: -1.9 }); // porte côté terre
    for (const [y, a] of [
      [2.2, 0.6],
      [3.8, 2.4],
      [3.8, -1.2],
    ] as const)
      b.box(0.32, 0.65, 0.2, 'window', { x: Math.sin(a) * 1.85, y, z: Math.cos(a) * 1.85, ry: a });

    // --- Muret de dalles de Moher le long du bord (seulement là où le sol est au sommet)
    for (let x = -40; x <= 40; x += 2.2) {
      const z = 4;
      const gy = ctx.groundAt(x, z);
      if (gy < -1.2 || gy > 1.5) continue;
      b.box(2.05, 1.0, 0.22, 'slate', { x, y: gy - 0.25, z, rz: (ctx.rng() - 0.5) * 0.08 });
    }

    // --- Paroi stratifiée (couches de schiste et de grès) le long de la côte
    cliffFace(b, ctx, { xFrom: -48, xTo: 48, step: 3 });

    // --- Aiguille rocheuse Branaunmore, posée sur le fond marin
    const sx = 10;
    const sz = 22;
    const base = Math.min(ctx.groundAt(sx, sz), ctx.waterY) - 1;
    const layers = 9;
    const top = -1.5;
    for (let i = 0; i < layers; i++) {
      const y = base + ((top - base) * i) / layers;
      const h = (top - base) / layers + 0.05;
      const r = 3.2 - i * 0.12;
      b.cylinder(r * 0.95, r, h, i % 2 ? 'rock' : 'rockDark', { x: sx, y, z: sz, ry: i * 0.4 }, 7);
    }
    b.cylinder(2.0, 2.2, 0.4, 'grassDark', { x: sx, y: top, z: sz }, 7);

    return b.mesh();
  },
};
