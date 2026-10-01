/**
 * Jetée de Nimmo (Galway) — longue jetée de pierre qui s'avance dans la baie
 * (côté +Z), à l'embouchure de la Corrib, face au quartier du Claddagh :
 * cygnes, barques et "Galway hookers" aux voiles rouge-brun.
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { hookerBoat, rowingBoat, swan } from '../../models/sceneryKit';

const LEN = 34;

export const nimmosPier: LandmarkDef = {
  id: 'nimmos_pier',
  name: 'Jetée de Nimmo',
  county: 'Galway',
  province: 'Connacht',
  category: 'ville',
  tier: 'secondaire',
  // Coordonnées approximatives de la racine de la jetée (à vérifier sur Google Maps)
  lat: 53.2665,
  lon: -9.048,
  rotationDeg: 0, // +Z vers la baie de Galway
  description: 'La jetée de pierre construite par l’ingénieur Alexander Nimmo au XIXe siècle, à l’embouchure de la Corrib, face au Claddagh.',
  funFact: 'On y croise les célèbres cygnes du Claddagh et parfois des « Galway hookers », les voiliers traditionnels aux voiles rouge-brun.',
  status: 'done',
  photo: { focus: [0, 2, LEN * 0.6], radius: 10, minDistance: 8, maxDistance: 200, bestHours: [19.5, 21.5] },
  clearRadius: 20, // dégage les maisons du quai
  colliders: [{ kind: 'box', x: 0, z: LEN / 2 + 2, hw: 2.4, hd: LEN / 2 + 2, rot: 0 }],

  build(ctx) {
    const b = new ModelBuilder();
    const top = Math.max(0.4, ctx.waterY + 1.6);
    const bottom = ctx.waterY - 2.5;
    // Jetée massive en pierre + parapet côté large
    b.box(4.2, top - bottom, LEN, 'stone', { z: LEN / 2 + 1, y: bottom });
    b.box(4.4, 0.25, LEN, 'stoneLight', { z: LEN / 2 + 1, y: top - 0.1 });
    b.box(0.6, 1, LEN, 'stoneDark', { x: 2, z: LEN / 2 + 1, y: top });
    // Musoir arrondi au bout + balise
    b.cylinder(2.6, 2.8, top - bottom, 'stone', { z: LEN + 1, y: bottom }, 12);
    b.cylinder(0.35, 0.4, 2.5, 'whitewash', { z: LEN + 1, y: top }, 8);
    b.box(0.6, 0.6, 0.6, 'lighthouseRed', { z: LEN + 1, y: top + 2.5 });
    // Bollards et anneaux
    for (let z = 4; z < LEN; z += 6) b.cylinder(0.22, 0.28, 0.6, 'black', { x: -1.7, z, y: top }, 8);
    // Bateaux amarrés côté abrité (−X) et cygnes
    hookerBoat(b, { x: -5.5, z: 12, y: ctx.waterY + 0.1, ry: 0.05 });
    hookerBoat(b, { x: -6, z: 24, y: ctx.waterY + 0.1, ry: -0.1 });
    rowingBoat(b, { x: -4, z: 31, y: ctx.waterY - 0.15, ry: 0.4, color: 'facadeA' });
    for (const [x, z, r] of [
      [-9, 6, 0.5],
      [-10.5, 7.5, 1.8],
      [-8, 17, -0.6],
      [-11, 19, 2.6],
    ])
      swan(b, { x, z, y: ctx.waterY - 0.1, ry: r });
    return b.mesh();
  },
};
