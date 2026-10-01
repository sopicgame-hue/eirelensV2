/**
 * MODÈLE DE FICHIER MONUMENT — à copier, PAS à importer.
 * (Ce fichier n'est pas dans index.ts : il ne s'affiche pas dans le jeu.)
 *
 * 1. Copie ce fichier sous le nom <id>.ts (ex : blarney_castle.ts)
 * 2. Remplis les champs, construis le modèle dans build()
 * 3. Ajoute l'import + l'entrée dans index.ts
 * 4. Teste : __eirelens.debugGoto('<id>') dans la console
 * Détails : docs/HOWTO_AJOUTER_UN_MONUMENT.md
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { towerHouse, celticCross } from '../../models/landmarkKit';

export const templateLandmark: LandmarkDef = {
  id: 'mon_monument', // snake_case, unique, ne plus jamais le changer
  name: 'Mon Monument',
  county: 'Cork',
  province: 'Munster',
  category: 'patrimoine', // 'nature' | 'monument' | 'patrimoine' | 'ville' | 'phare'
  lat: 51.9291, // Google Maps : clic droit sur le lieu → la 1re valeur est la latitude
  lon: -8.5709, // …la 2e est la longitude
  rotationDeg: 0, // oriente l'axe +Z local (façade principale) ; 0 = vers le sud
  description: 'Une phrase qui décrit le lieu.',
  funFact: 'Une anecdote vraie et vérifiable.',
  status: 'done',
  photo: {
    focus: [0, 6, 0], // centre du sujet : [x local, hauteur au-dessus du sol, z local]
    radius: 7, // ≈ demi-hauteur visible du sujet
    minDistance: 8,
    maxDistance: 250,
    // bestHours: [19, 21], // optionnel : bonus d'heure
  },
  clearRadius: 18, // pas d'arbres/maisons générés dans ce rayon
  terrain: [{ kind: 'flatten', radius: 12, blend: 10 }], // sol plat sous le monument
  colliders: [{ kind: 'box', x: 0, z: 0, hw: 3.5, hd: 3, rot: 0 }], // on ne traverse pas les murs

  build(ctx) {
    const b = new ModelBuilder();
    // Brique du kit : un château irlandais typique
    towerHouse(b, { width: 7, depth: 6, height: 14 });
    // Pièces sur mesure : (largeur, hauteur, profondeur, couleur, placement)
    b.box(10, 1.2, 0.6, 'stone', { z: 6, y: ctx.groundAt(0, 6) - 0.2 }); // muret qui suit le sol
    celticCross(b, { x: 6, z: 4, y: ctx.groundAt(6, 4) });
    return b.mesh();
  },
};
