/**
 * Eau : un seul grand plan au niveau WORLD.WATER_LEVEL qui suit le joueur.
 * Mer, lacs et rivières partagent ce niveau (le relief est creusé en dessous).
 * Les vaguelettes viennent d'une normal map générée en code et qui défile.
 */
import * as THREE from 'three';
import { WORLD } from '../config/gameConfig';
import { hash2 } from '../core/math';

/** Bruit de valeur PÉRIODIQUE (période `p` cellules) : la texture se répète sans couture. */
function periodicNoise(x: number, y: number, p: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = x - xi;
  const v = y - yi;
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  const h = (i: number, j: number) => hash2(((i % p) + p) % p, ((j % p) + p) % p, seed);
  const a = h(xi, yi);
  const b = h(xi + 1, yi);
  const c = h(xi, yi + 1);
  const d = h(xi + 1, yi + 1);
  return (a + (b - a) * su) * (1 - sv) + (c + (d - c) * su) * sv;
}

function makeNormalMap(size = 128) {
  const data = new Uint8Array(size * size * 4);
  const hgt = (x: number, y: number) =>
    periodicNoise((x / size) * 8, (y / size) * 8, 8, 3) * 0.6 + periodicNoise((x / size) * 16, (y / size) * 16, 16, 4) * 0.4;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = hgt((x + 1) % size, y) - hgt((x - 1 + size) % size, y);
      const dy = hgt(x, (y + 1) % size) - hgt(x, (y - 1 + size) % size);
      const n = new THREE.Vector3(-dx * 4, -dy * 4, 1).normalize();
      const k = (y * size + x) * 4;
      data[k] = (n.x * 0.5 + 0.5) * 255;
      data[k + 1] = (n.y * 0.5 + 0.5) * 255;
      data[k + 2] = (n.z * 0.5 + 0.5) * 255;
      data[k + 3] = 255;
    }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(60, 60);
  tex.needsUpdate = true;
  return tex;
}

export class Water {
  readonly mesh: THREE.Mesh;
  private normal: THREE.DataTexture;
  private material: THREE.MeshPhongMaterial;

  constructor() {
    this.normal = makeNormalMap();
    this.material = new THREE.MeshPhongMaterial({
      color: 0x2f9fc4,
      specular: 0xffffff,
      shininess: 90,
      transparent: true,
      opacity: 0.86,
      normalMap: this.normal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      depthWrite: false,
    });
    const geo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.y = WORLD.WATER_LEVEL;
    this.mesh.renderOrder = 1;
    this.mesh.receiveShadow = true;
    this.mesh.name = 'water';
  }

  update(dt: number, focusX: number, focusZ: number, dayLight: number) {
    // Suit le joueur par pas de 50 u (évite que la texture "glisse")
    this.mesh.position.x = Math.round(focusX / 50) * 50;
    this.mesh.position.z = Math.round(focusZ / 50) * 50;
    this.normal.offset.x = (this.normal.offset.x + dt * 0.004) % 1;
    this.normal.offset.y = (this.normal.offset.y + dt * 0.0025) % 1;
    // Teinte plus sombre la nuit
    this.material.color.setHSL(0.54, 0.6, 0.22 + 0.22 * dayLight);
  }
}
