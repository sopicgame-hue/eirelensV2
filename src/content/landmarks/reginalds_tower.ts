/**
 * Reginald's Tower (Waterford) — tour ronde médiévale en pierre au toit
 * conique, avec un pan des remparts de la ville et une petite place pavée.
 * La porte (+Z) regarde le centre de Waterford.
 * NB : la Suir n'existe pas encore dans le jeu à Waterford (le vrai quai est au
 * nord de la tour). Pour l'ajouter : world/data/rivers.ts, puis vérifier les routes.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';

const R = 4; // rayon de la tour
const H = 9; // hauteur des murs

export const reginaldsTower: LandmarkDef = {
  id: 'reginalds_tower',
  name: 'Tour de Reginald',
  county: 'Waterford',
  province: 'Munster',
  category: 'patrimoine',
  tier: 'secondaire',
  // Position réelle : 52.2604, -7.1054, au carrefour des routes du centre de
  // Waterford. Décalé d'~20 u au sud-est pour dégager les routes.
  lat: 52.2471,
  lon: -7.0987,
  rotationDeg: -163, // porte tournée vers le centre-ville
  description: 'La tour ronde de Reginald, sur le quai de Waterford, la plus vieille ville d’Irlande, fondée par les Vikings.',
  funFact: 'C’est le plus ancien bâtiment civil d’Irlande. On raconte que le Normand Strongbow y épousa Aoife, fille du roi de Leinster, en 1170.',
  status: 'done',
  photo: { focus: [0, 6, 0], radius: 7.5, minDistance: 8, maxDistance: 180, bestHours: [19, 21] },
  clearRadius: 18,
  terrain: [{ kind: 'flatten', radius: 14, blend: 6 }],
  colliders: [
    { kind: 'circle', x: 0, z: 0, r: R + 0.3 },
    { kind: 'box', x: -9, z: -1, hw: 5, hd: 0.9, rot: 0.15 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    // Tour : fût légèrement évasé à la base, bandeau, toit conique d'ardoise
    b.cylinder(R, R + 0.5, 2, 'stoneDark', {}, 16);
    b.cylinder(R - 0.1, R, H - 2, 'stone', { y: 2 }, 16);
    b.cylinder(R + 0.15, R + 0.15, 0.4, 'stoneLight', { y: H }, 16);
    b.cone(R + 0.4, 4.2, 'slate', { y: H + 0.4 }, 16);
    b.box(0.15, 1.2, 0.15, 'black', { y: H + 4.5 }); // girouette
    // Petites fenêtres et meurtrières tout autour
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const ry = Math.atan2(Math.sin(a), Math.cos(a));
      for (const y of [3.2, 6.2]) b.box(0.5, 1.1, 0.2, 'black', { x: Math.sin(a) * (R - 0.02), z: Math.cos(a) * (R - 0.02), y: y + (i % 2) * 0.6, ry });
    }
    b.box(1.2, 2.2, 0.3, 'woodDark', { z: R + 0.2 }); // porte côté quai
    // Pan de rempart viking/normand avec chemin de ronde
    b.push({ x: -9, z: -1, ry: 0.15 });
    b.box(10, 5, 1.6, 'stone');
    b.crenellations(10, 1.6, 'stone', { y: 5 }, 0.5);
    b.pop();
    // Petite place pavée devant la porte, réverbère et banc
    b.box(16, 0.1, 8, 'stoneLight', { z: 8, y: ctx.groundAt(0, 8) + 0.01 });
    b.cylinder(0.12, 0.15, 3.2, 'black', { x: 4.5, z: 6, y: ctx.groundAt(4.5, 6) }, 6);
    b.box(0.5, 0.6, 0.5, 'glass', { x: 4.5, z: 6, y: ctx.groundAt(4.5, 6) + 3.2 });
    b.box(2, 0.15, 0.6, 'wood', { x: -3.5, z: 7, y: ctx.groundAt(-3.5, 7) + 0.5 });
    for (const x of [-4.3, -2.7]) b.box(0.15, 0.5, 0.5, 'black', { x, z: 7, y: ctx.groundAt(x, 7) });
    return b.mesh();
  },
};
