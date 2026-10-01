/**
 * Peace Bridge (Derry/Londonderry) — passerelle en S sur la Foyle (2011),
 * deux mâts inclinés en sens opposés, haubans. Origine sur la rive ouest,
 * la passerelle traverse la rivière vers +Z (rotationDeg).
 */
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { beam } from '../../models/sceneryKit';

const LEN = 30; // longueur totale (rive à rive, rampes comprises)
const START = -6;

/** Tracé en S : décalage latéral (x) en fonction de la position le long du pont. */
const sx = (z: number) => Math.sin(((z - START) / LEN) * Math.PI * 2) * 3;

export const peaceBridge: LandmarkDef = {
  id: 'peace_bridge',
  name: 'Peace Bridge',
  county: 'Derry',
  province: 'Ulster',
  category: 'ville',
  tier: 'secondaire',
  // Rive ouest, juste au nord du pont routier du jeu ; légèrement ajusté au tracé de la Foyle
  lat: 55.009,
  lon: -7.2935,
  rotationDeg: 95, // +Z : traverse la Foyle vers l'est
  description: 'Une passerelle en forme de S qui relie depuis 2011 les deux rives de la Foyle — et symboliquement les deux communautés de la ville.',
  funFact: 'Ses deux mâts penchent l’un vers l’autre sans se toucher : les architectes y voyaient une « poignée de main » entre les deux rives.',
  status: 'done',
  photo: { focus: [0, 5, 9], radius: 11, minDistance: 10, maxDistance: 220, bestHours: [19, 21.5] },
  clearRadius: 28, // dégage les berges (pas de maisons au bord du pont)
  colliders: [
    { kind: 'circle', x: sx(-3), z: -3, r: 0.8 },
    { kind: 'circle', x: sx(21), z: 21, r: 0.8 },
  ],

  build(ctx) {
    const b = new ModelBuilder();
    const deckY = Math.max(0.3, ctx.waterY + 1.8);
    // Tablier : segments qui suivent le S, garde-corps blancs, lampadaires
    const N = 20;
    for (let i = 0; i < N; i++) {
      const z0 = START + (i / N) * LEN;
      const z1 = START + ((i + 1) / N) * LEN;
      const x0 = sx(z0);
      const x1 = sx(z1);
      const ry = Math.atan2(x1 - x0, z1 - z0);
      const seg = Math.hypot(x1 - x0, z1 - z0) + 0.1;
      const zc = (z0 + z1) / 2;
      const xc = (x0 + x1) / 2;
      const y = Math.max(deckY, ctx.groundAt(xc, zc) + 0.1);
      b.box(3.2, 0.35, seg, 'stoneLight', { x: xc, z: zc, y: y - 0.35, ry });
      for (const s of [-1, 1]) b.box(0.1, 1.1, seg, 'white', { x: xc + s * 1.55 * Math.cos(ry), z: zc - s * 1.55 * Math.sin(ry), y, ry });
      if (i % 4 === 0) b.box(0.12, 2.6, 0.12, 'black', { x: xc + 1.55 * Math.cos(ry), z: zc - 1.55 * Math.sin(ry), y });
    }
    // Deux mâts blancs inclinés en sens opposés + haubans vers le tablier
    const masts: [number, number][] = [
      [-3, 1],
      [21, -1],
    ];
    for (const [mz, lean] of masts) {
      const bx = sx(mz) + lean * 2.2;
      const top = { x: bx - lean * 3.5, y: 15, z: mz + lean * 3 };
      beam(b, bx, ctx.groundAt(bx, mz) - 0.5, mz, top.x, top.y, top.z, 0.35, 'whitewash', 8);
      for (let k = 1; k <= 7; k++) {
        const dz = mz + lean * k * 1.6;
        beam(b, top.x, top.y, top.z, sx(dz), deckY + 0.2, dz, 0.05, 'stoneLight', 4);
      }
    }
    // Quais bas en pierre sur chaque rive
    b.box(8, 0.5, 4, 'stoneDark', { x: sx(-5), z: -7, y: -0.3 });
    b.box(8, 0.5, 4, 'stoneDark', { x: sx(24), z: 26, y: ctx.groundAt(0, 26) - 0.3 });
    return b.mesh();
  },
};
