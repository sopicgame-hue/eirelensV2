/**
 * Titanic Belfast — le musée aux quatre "proues" argentées, construit sur les
 * chantiers navals Harland & Wolff, face aux cales de lancement (côté +Z,
 * vers l'eau). Chaque proue = une étrave de navire extrudée, dont les étages
 * s'élargissent en montant (porte-à-faux), disposées en croix.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const LEVELS = 4;
const LEVEL_H = 5;

/** Plan en forme d'étrave (pointe vers +Z), extrudé vers le haut sur `h`. */
function prow(w: number, len: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, len - w * 0.8);
  s.lineTo(0, len);
  s.lineTo(-w / 2, len - w * 0.8);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  g.rotateX(Math.PI / 2); // le plan XY devient XZ, extrusion vers −Y…
  g.translate(0, h, 0); // …qu'on remonte pour poser la forme sur y = 0
  return g;
}

export const titanicBelfast: LandmarkDef = {
  id: 'titanic_belfast',
  name: 'Titanic Belfast',
  county: 'Antrim',
  province: 'Ulster',
  category: 'ville',
  tier: 'principal',
  // Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.
  lat: 54.6081,
  lon: -5.9187,
  rotationDeg: 90, // +Z vers les cales de lancement et l'eau
  description: 'Le musée du Titanic, bâti à l’endroit même où le paquebot a été dessiné, construit et lancé en 1911.',
  funFact: 'Le bâtiment a exactement la hauteur de la coque du Titanic (38 m) et sa façade est couverte de 3 000 écailles d’aluminium argenté.',
  status: 'done',
  photo: { focus: [0, 10, 0], radius: 14, minDistance: 16, maxDistance: 320, bestHours: [19, 21] },
  clearRadius: 30,
  // Petit aplanissement seulement : un 'flatten' trop large comblerait l'eau voisine (rayon + blend < distance à l'eau)
  terrain: [{ kind: 'flatten', radius: 7, blend: 3 }],
  colliders: [
    { kind: 'box', x: 0, z: 0, hw: 4, hd: 15, rot: Math.PI / 4 },
    { kind: 'box', x: 0, z: 0, hw: 4, hd: 15, rot: -Math.PI / 4 },
  ],

  build() {
    const b = new ModelBuilder();
    // Noyau central vitré (atrium)
    b.box(8, LEVELS * LEVEL_H, 8, 'glass', { ry: Math.PI / 4 });
    // Quatre proues en croix (diagonales), étages en porte-à-faux qui s'élargissent
    for (let k = 0; k < 4; k++) {
      b.push({ ry: (k * Math.PI) / 2 + Math.PI / 4 });
      for (let i = 0; i < LEVELS; i++) {
        const w = 5.5 + i * 1.0;
        const len = 12 + i * 2.4;
        b.add(prow(w, len, LEVEL_H - 0.3), i % 2 ? 'chrome' : 'quartz', { y: i * LEVEL_H, z: 2 });
        b.add(prow(w + 0.15, len + 0.1, 0.3), 'stoneDark', { y: (i + 1) * LEVEL_H - 0.3, z: 2 });
      }
      b.pop();
    }
    // Esplanade + tracé blanc des cales du Titanic et de l'Olympic vers l'eau (+Z)
    b.box(34, 0.1, 34, 'stoneLight', { y: 0.02 });
    for (const x of [-7, 7]) {
      b.box(10, 0.12, 30, 'slate', { x, z: 30, y: 0.03 });
      b.box(0.4, 0.14, 30, 'white', { x: x - 4, z: 30, y: 0.04 });
      b.box(0.4, 0.14, 30, 'white', { x: x + 4, z: 30, y: 0.04 });
    }
    return b.mesh();
  },
};
