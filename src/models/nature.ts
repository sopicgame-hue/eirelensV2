/**
 * Modèles de nature réutilisables (géométries partagées, créées une seule fois).
 * Utilisés en "instancing" par Scatter.ts : 1 géométrie → des centaines de copies.
 */
import * as THREE from 'three';
import { ModelBuilder } from './ModelBuilder';

let cache: Record<string, THREE.BufferGeometry> | null = null;

export function natureGeometries() {
  if (cache) return cache;
  const b = new ModelBuilder();

  // Feuillu rond (chêne / frêne) ~5 u
  b.cylinder(0.22, 0.32, 1.8, 'trunk', {}, 6);
  b.sphere(1.5, 'leaf', { y: 2.9 }, 0);
  b.sphere(1.0, 'leafLight', { x: 0.7, y: 3.6, z: 0.3 }, 0);
  b.sphere(0.9, 'leafDark', { x: -0.6, y: 3.3, z: -0.4 }, 0);
  const treeRound = b.build();

  // Conifère (plantations de Sitka) ~6 u
  b.cylinder(0.18, 0.25, 1.2, 'trunk', {}, 5);
  b.cone(1.5, 2.6, 'leafDark', { y: 1.0 }, 7);
  b.cone(1.1, 2.2, 'leafDark', { y: 2.6 }, 7);
  b.cone(0.7, 1.6, 'leaf', { y: 3.9 }, 7);
  const treePine = b.build();

  // Buisson d'ajonc (fleurs jaunes)
  b.sphere(0.8, 'leafDark', { y: 0.5 }, 0);
  b.sphere(0.25, 'gorse', { x: 0.5, y: 0.9, z: 0.2 }, 0);
  b.sphere(0.22, 'gorse', { x: -0.3, y: 1.0, z: 0.4 }, 0);
  b.sphere(0.2, 'gorse', { x: 0.1, y: 1.1, z: -0.5 }, 0);
  const bush = b.build();

  // Rocher
  b.sphere(1, 'rock', { y: 0.3, sy: 0.7 }, 0);
  const rock = b.build();

  cache = { treeRound, treePine, bush, rock };
  return cache;
}
