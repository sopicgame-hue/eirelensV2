/**
 * Modèle PROVISOIRE utilisé pour tout monument au statut 'placeholder' :
 * un cairn de pierres avec un panneau en bois et un fanion vert.
 * Le monument est déjà photographiable ; il reste à remplacer ce modèle
 * par le vrai (voir docs/HOWTO_AJOUTER_UN_MONUMENT.md).
 */
import { ModelBuilder } from '../../models/ModelBuilder';

export function buildPlaceholder() {
  const b = new ModelBuilder();
  // Cairn
  b.cylinder(1.6, 2.2, 1.0, 'stone', {}, 7);
  b.cylinder(1.1, 1.6, 0.9, 'stoneLight', { y: 1.0 }, 7);
  b.cylinder(0.5, 1.1, 0.8, 'stone', { y: 1.9 }, 7);
  b.sphere(0.45, 'stoneDark', { y: 2.9 }, 0);
  // Panneau
  b.box(0.18, 2.2, 0.18, 'wood', { x: 2.6, z: 0.8 });
  b.box(1.6, 0.7, 0.1, 'woodDark', { x: 2.6, y: 1.5, z: 0.9 });
  // Fanion
  b.cylinder(0.05, 0.05, 2.4, 'woodDark', { y: 3.2 }, 5);
  b.box(0.9, 0.5, 0.04, 'grass', { x: 0.45, y: 5.0 });
  return b.mesh();
}
