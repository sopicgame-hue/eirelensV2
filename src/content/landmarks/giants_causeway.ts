/**
 * Chaussée des Géants (Antrim) — colonnes de basalte hexagonales.
 * Repère local : origine = haut de la plage ; +Z = vers la mer (nord).
 * Astuce : le sommet de chaque colonne suit le RELIEF (ctx.groundAt) →
 * le joueur marche naturellement "sur" les colonnes, sans collision spéciale
 * (les petites marches de 0,5 u côté terre sont purement visuelles).
 * Les tampons de terrain dessinent la langue de terre qui s'avance dans la mer.
 *
 * PERFORMANCE : des centaines de colonnes identiques → on utilise un
 * InstancedMesh (1 géométrie, N copies) au lieu de fusionner N cylindres.
 * C'est LE bon réflexe dès qu'un élément se répète plus de ~50 fois.
 */
import * as THREE from 'three';
import { LandmarkDef } from './types';
import { ModelBuilder } from '../../models/ModelBuilder';
import { sharedMaterials } from '../../models/materials';

export const giantsCauseway: LandmarkDef = {
  id: 'giants_causeway',
  name: 'Chaussée des Géants',
  county: 'Antrim',
  province: 'Ulster',
  category: 'nature',
  lat: 55.2408,
  lon: -6.5116,
  rotationDeg: -140,
  description: 'Environ 40 000 colonnes de basalte, pour la plupart hexagonales, nées d’une coulée de lave il y a quelque 60 millions d’années.',
  funFact: 'La légende raconte que le géant Finn McCool l’a construite pour aller affronter son rival écossais Benandonner.',
  status: 'done',
  photo: { focus: [0, 1.5, 5], radius: 8, minDistance: 5, maxDistance: 220, bestHours: [19, 21] },
  clearRadius: 26,
  terrain: [
    { kind: 'flatten', dz: -6, radius: 9, height: 2.2, blend: 8 },
    { kind: 'island', dz: 4, radius: 6, height: 1.4, blend: 5 },
    { kind: 'island', dz: 11, radius: 4.5, height: 0.6, blend: 4 },
  ],

  build(ctx) {
    const root = new THREE.Group();
    const r = 0.6; // rayon d'une colonne
    // Colonne unitaire (hauteur 1) : fût de basalte + liseré clair au sommet
    const unit = new ModelBuilder();
    unit.hexColumn(r * 0.97, 0.93, 'basalt', { ry: Math.PI / 6 });
    unit.hexColumn(r * 0.93, 0.07, 'basaltTop', { y: 0.93, ry: Math.PI / 6 });
    const columns: THREE.Matrix4[] = [];
    const dx = r * Math.sqrt(3);
    const dzRow = r * 1.5;
    let rows = 0;
    for (let z = -13; z <= 17; z += dzRow) {
      rows++;
      const offset = rows % 2 ? 0 : dx / 2;
      // largeur de la "langue" : large côté terre, étroite côté mer
      const halfW = 7.5 - Math.max(0, z) * 0.32;
      for (let x = -halfW + offset; x <= halfW; x += dx) {
        const g = ctx.groundAt(x, z);
        if (g < ctx.waterY - 0.9) continue; // trop profond : rien
        const jitter = (Math.floor(ctx.rng() * 4) - 1.5) * 0.12;
        // Côté terre (z < -4) : marches plus hautes, comme les gradins naturels
        const steps = z < -4 ? Math.floor(ctx.rng() * 3) * 0.45 * Math.min(1, (-4 - z) / 6) : 0;
        const top = Math.max(g, ctx.waterY - 0.3) + 0.15 + jitter + steps;
        const bottom = Math.min(g, ctx.waterY) - 2;
        columns.push(new THREE.Matrix4().compose(new THREE.Vector3(x, bottom, z), new THREE.Quaternion(), new THREE.Vector3(1, top - bottom, 1)));
      }
    }
    const im = new THREE.InstancedMesh(unit.build(), sharedMaterials().world, columns.length);
    columns.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    im.castShadow = im.receiveShadow = true;
    root.add(im);

    // Rocher de la "Botte du géant"
    const b = new ModelBuilder();
    b.sphere(1.2, 'basalt', { x: 5, y: ctx.groundAt(5, -2) + 0.8, z: -2, sx: 0.8, sy: 1.2, sz: 1.6 }, 0);
    root.add(b.mesh());
    return root;
  },
};
