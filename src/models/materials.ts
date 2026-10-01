/**
 * Matériaux partagés. Règle de performance : ne JAMAIS créer un nouveau
 * matériau par objet. Réutilise ceux-ci (les couleurs sont portées par les
 * sommets via ModelBuilder, donc un seul matériau suffit pour tout un modèle).
 */
import * as THREE from 'three';

let cache: ReturnType<typeof create> | null = null;

function toonGradient() {
  // 3 paliers de lumière = rendu "cel-shading" doux façon Pokémon 3DS
  const data = new Uint8Array([90, 90, 90, 255, 180, 180, 180, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function create() {
  const gradientMap = toonGradient();
  return {
    /** Bâtiments, monuments, rochers, arbres, véhicules. */
    world: new THREE.MeshLambertMaterial({ vertexColors: true }),
    /** Relief (facettes visibles). */
    terrain: new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
    /** Personnages et mouton : cel-shading. */
    character: new THREE.MeshToonMaterial({ vertexColors: true, gradientMap }),
    /** Routes : légèrement décalées pour ne pas "clignoter" avec le sol. */
    road: new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    /** Éléments lumineux (lanterne de phare, fenêtres éclairées) : non éclairé = brille la nuit. */
    glow: new THREE.MeshBasicMaterial({ color: 0xfff1a8 }),
    /** Eau décorative des monuments (cascades, lacs de montagne, bassins) : couleur portée par le matériau. */
    water: new THREE.MeshPhongMaterial({ color: 0x3aa6c8, specular: 0xffffff, shininess: 70, transparent: true, opacity: 0.88, depthWrite: false }),
    /** Écume blanche des cascades et des vagues. */
    foam: new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
    /** Bronze (statues) : légèrement brillant. */
    bronze: new THREE.MeshPhongMaterial({ color: 0x8c6a3f, specular: 0xd9b77a, shininess: 40 }),
  };
}

export function sharedMaterials() {
  if (!cache) cache = create();
  return cache;
}
