/**
 * ZoneGates — barrières "ZONE VERROUILLÉE" posées automatiquement sur chaque
 * route qui franchit la frontière d'une zone fermée. Elles disparaissent
 * quand les deux zones sont ouvertes. Aucune donnée à saisir : les points de
 * passage sont calculés à partir des routes (world/data/roads.ts) et des zones.
 *
 * Le blocage lui-même est le "mur invisible" (movement.ts + Zones.canEnter) :
 * la barrière n'est que l'habillage visuel, à l'endroit où l'on bute.
 */
import * as THREE from 'three';
import { WorldGrid } from '../world/WorldGrid';
import { Heightfield } from '../world/Heightfield';
import { ModelBuilder } from '../models/ModelBuilder';
import { sharedMaterials } from '../models/materials';
import { Zones } from './Zones';
import type { ZoneId } from '../world/data/zones';

interface Gate {
  /** Zone côté "arrière" (a) et "avant" (b) de la barrière (avant = +Z local). */
  a: ZoneId;
  b: ZoneId;
  /** Point exact de la frontière sur la route, et direction de la route (a → b). */
  x: number;
  z: number;
  dx: number;
  dz: number;
  mesh: THREE.Group;
}

/** Recul (u) de la barrière dans la zone fermée : le joueur bute dessus au lieu de la traverser. */
const GATE_OFFSET = 0.8;

let signMaterial: THREE.MeshLambertMaterial | null = null;

/** Texture du panneau, dessinée en code (pas d'image externe). */
function lockedSignMaterial() {
  if (signMaterial) return signMaterial;
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f5c518';
  g.fillRect(0, 0, 320, 128);
  g.lineWidth = 8;
  g.strokeStyle = '#1d1d1f';
  g.strokeRect(6, 6, 308, 116);
  // Cadenas
  g.fillStyle = '#1d1d1f';
  g.fillRect(22, 58, 44, 36);
  g.lineWidth = 7;
  g.beginPath();
  g.arc(44, 58, 13, Math.PI, 0);
  g.stroke();
  // Texte ajusté à la place disponible (polices différentes selon l'appareil)
  const fit = (text: string, size: number, y: number) => {
    g.font = `900 ${size}px Nunito, system-ui, sans-serif`;
    const w = g.measureText(text).width;
    if (w > 220) g.font = `900 ${Math.floor((size * 220) / w)}px Nunito, system-ui, sans-serif`;
    g.fillText(text, 84, y);
  };
  g.textAlign = 'left';
  fit('ZONE', 34, 56);
  fit('VERROUILLÉE', 30, 96);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  signMaterial = new THREE.MeshLambertMaterial({ map: tex });
  return signMaterial;
}

/** Barrière de ferme irlandaise (piliers chaulés + portail vert) + panneau, à travers la route (axe X). */
function buildGateGeometry() {
  const b = new ModelBuilder();
  for (const s of [-1, 1]) {
    b.box(0.7, 1.6, 0.7, 'whitewash', { x: s * 3.3 });
    b.cone(0.5, 0.4, 'whitewash', { x: s * 3.3, y: 1.6 }, 4);
  }
  for (const y of [0.3, 0.6, 0.9, 1.2]) b.box(6, 0.1, 0.08, 'trainGreen', { y });
  for (const x of [-2.9, -1.5, 0, 1.5, 2.9]) b.box(0.1, 1.05, 0.08, 'trainGreen', { x, y: 0.25 });
  b.box(0.08, 1.2, 0.08, 'trainGreen', { x: -1.5, y: 0.25, rz: 0.75 });
  b.box(0.08, 1.2, 0.08, 'trainGreen', { x: 1.5, y: 0.25, rz: -0.75 });
  b.box(0.12, 2.3, 0.12, 'black', { x: 1.6, z: -0.7 }); // poteau du panneau
  return { frame: b.build() };
}

/** Une barrière complète (utilisée par l'atelier 3D ; le jeu partage les géométries). */
export function buildGateModel(): THREE.Group {
  const { frame } = buildGateGeometry();
  return assembleGate(frame, new THREE.PlaneGeometry(2.5, 1.0));
}

function assembleGate(frame: THREE.BufferGeometry, sign: THREE.BufferGeometry) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(frame, sharedMaterials().world);
  m.castShadow = true;
  m.userData.sharedGeometry = true;
  g.add(m);
  // Panneau visible des deux côtés
  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(sign, lockedSignMaterial());
    p.position.set(1.6, 1.85, -0.7 + side * 0.07);
    p.rotation.y = side > 0 ? 0 : Math.PI;
    p.userData.sharedGeometry = true;
    g.add(p);
  }
  return g;
}

export class ZoneGates {
  readonly group = new THREE.Group();
  private gates: Gate[] = [];

  constructor(grid: WorldGrid, hf: Heightfield, zones: Zones) {
    this.group.name = 'zoneGates';
    const { frame } = buildGateGeometry();
    const sign = new THREE.PlaneGeometry(2.5, 1.0);
    const samples = grid.roadSamples;
    for (const r of grid.routeRanges) {
      for (let n = r.start; n < r.end - 1; n++) {
        const s0 = samples[n];
        const s1 = samples[n + 1];
        const z0 = zones.zoneAt(s0.x, s0.z).id;
        const z1 = zones.zoneAt(s1.x, s1.z).id;
        if (z0 === z1) continue;
        // Point exact de la frontière entre les deux échantillons (dichotomie)
        let t0 = 0;
        let t1 = 1;
        for (let k = 0; k < 12; k++) {
          const tm = (t0 + t1) / 2;
          if (zones.zoneAt(s0.x + (s1.x - s0.x) * tm, s0.z + (s1.z - s0.z) * tm).id === z0) t0 = tm;
          else t1 = tm;
        }
        const x = s0.x + (s1.x - s0.x) * t0;
        const z = s0.z + (s1.z - s0.z) * t0;
        const len = Math.hypot(s1.x - s0.x, s1.z - s0.z) || 1;
        const g = assembleGate(frame, sign);
        g.rotation.y = Math.atan2(s1.x - s0.x, s1.z - s0.z);
        this.group.add(g);
        this.gates.push({ a: z0, b: z1, x, z, dx: (s1.x - s0.x) / len, dz: (s1.z - s0.z) / len, mesh: g });
        this.place(this.gates[this.gates.length - 1], hf, false);
      }
    }
  }

  get count() {
    return this.gates.length;
  }

  private hf?: Heightfield;

  /** Pose la barrière juste à l'intérieur de la zone fermée. */
  private place(g: Gate, hf: Heightfield, bLocked: boolean) {
    this.hf = hf;
    const o = bLocked ? GATE_OFFSET : -GATE_OFFSET;
    const x = g.x + g.dx * o;
    const z = g.z + g.dz * o;
    g.mesh.position.set(x, hf.heightAt(x, z), z);
  }

  /** Affiche les barrières des frontières encore fermées. */
  refresh(isOpen: (id: ZoneId) => boolean) {
    for (const g of this.gates) {
      g.mesh.visible = !(isOpen(g.a) && isOpen(g.b));
      if (this.hf) this.place(g, this.hf, !isOpen(g.b));
    }
  }
}
