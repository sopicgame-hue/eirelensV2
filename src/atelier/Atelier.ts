/**
 * ATELIER 3D — outil de création : affiche UN modèle seul, sur un sol plat
 * quadrillé (1 case = 1 unité), à côté d'un personnage (1,6 u) et du mouton
 * pour juger l'échelle. Montre aussi les obstacles (rouge), le sujet photo
 * (jaune), la zone dégagée (blanc) et l'axe avant +Z (flèche bleue).
 *
 * Ouvrir : bouton "Atelier 3D" de l'écran titre, ou URL ?atelier=landmark:<id>
 * (ou vehicle:<id>, station:station, gate:gate).
 * Ce n'est PAS le jeu : rien n'est sauvegardé, aucune règle de gameplay.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LANDMARKS } from '../content/landmarks';
import { BuildContext } from '../content/landmarks/types';
import { buildPlaceholder } from '../content/landmarks/_placeholder';
import { VEHICLES } from '../content/vehicles';
import { DEFAULT_CUSTOMIZATION } from '../content/customization';
import { buildCharacter } from '../models/characterModel';
import { buildSheep } from '../models/sheepModel';
import { buildStation, STATION_LAYOUT } from '../models/stationModel';
import { buildGateModel } from '../systems/ZoneGates';
import { Colliders, ColliderShape } from '../world/Colliders';
import type { Heightfield } from '../world/Heightfield';
import { Player } from '../entities/Player';
import { Sheep } from '../entities/Sheep';
import { makeRng } from '../core/math';
import { sharedMaterials } from '../models/materials';
import type { AtelierKind } from './catalog';

export interface AtelierOptions {
  gauges: boolean;
  overlays: boolean;
  /** Simule la mer devant le modèle (+Z au-delà de 14 u) : utile pour les phares, ports, falaises. */
  sea: boolean;
  /** Vitesse simulée des véhicules (animation des roues / pattes / hélice). */
  speed: number;
}

export interface AtelierInfo {
  title: string;
  lines: string[];
  warnings: string[];
}

const SEA_Z = 14;
const SEA_FLOOR = -3;
const WATER_Y = -1.2;

/** Faux monde pour faire tenir un joueur / un mouton immobiles à l'origine. */
function stubWorld() {
  const hf = { heightAt: () => 0, slopeAt: () => 0, waterDepthAt: () => -5 } as unknown as Heightfield;
  return { hf, colliders: new Colliders() };
}

export class Atelier {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  private controls: OrbitControls;
  private current = new THREE.Group();
  private overlays = new THREE.Group();
  private gauges = new THREE.Group();
  private water: THREE.Mesh;
  private ground: THREE.Mesh;
  private raf = 0;
  private last = performance.now();
  private time = 0;
  private animateFn: ((dt: number, t: number) => void) | null = null;
  opts: AtelierOptions = { gauges: true, overlays: true, sea: false, speed: 0 };
  onInfo: (info: AtelierInfo) => void = () => {};

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.background = new THREE.Color(0xbfe3f2);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6fbf4a, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.7);
    sun.position.set(40, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -60;
    sc.right = sc.top = 60;
    sc.far = 300;
    this.scene.add(sun);

    // Sol (vert) + quadrillage : fines lignes = 1 u, lignes foncées = 10 u
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x86c95a }));
    this.ground.receiveShadow = true;
    this.ground.position.y = -0.01;
    const seaFloor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x3b7f8c }));
    seaFloor.position.y = SEA_FLOOR;
    this.scene.add(this.ground, seaFloor);
    const g1 = new THREE.GridHelper(120, 120, 0x5f9a45, 0x76b552);
    g1.position.y = 0.005;
    const g10 = new THREE.GridHelper(120, 12, 0x2e5e22, 0x2e5e22);
    g10.position.y = 0.01;
    this.scene.add(g1, g10);
    // Axe avant +Z
    this.scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.05, 0), 8, 0x1f6fb2, 1.5, 0.8));

    this.water = new THREE.Mesh(new THREE.PlaneGeometry(400, 200).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2f9fc4, transparent: true, opacity: 0.85 }));
    this.water.position.set(0, WATER_Y, SEA_Z + 100);
    this.scene.add(this.water, this.current, this.overlays, this.gauges);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.raf = requestAnimationFrame(this.loop);
  }

  // ---------------------------------------------------------------- affichage
  show(kind: AtelierKind, id: string) {
    this.clear();
    const lines: string[] = [];
    const warnings: string[] = [];
    let title = id;
    let colliders: ColliderShape[] = [];
    this.water.visible = this.opts.sea;
    // Mer devant : le sol s'arrête à z = SEA_Z, au-delà fond marin + eau
    this.ground.scale.z = this.opts.sea ? (200 + SEA_Z) / 400 : 1;
    this.ground.position.z = this.opts.sea ? (SEA_Z - 200) / 2 : 0;

    if (kind === 'landmark') {
      const def = LANDMARKS.find((l) => l.id === id);
      if (!def) return this.onInfo({ title: `Inconnu : ${id}`, lines: [], warnings: [] });
      title = def.name;
      const ctx: BuildContext = {
        groundAt: (_dx, dz) => (this.opts.sea && dz > SEA_Z ? SEA_FLOOR : 0),
        waterY: this.opts.sea ? WATER_Y : -10,
        rng: makeRng(12345),
      };
      let obj: THREE.Object3D;
      try {
        obj = def.build && def.status === 'done' ? def.build(ctx) : buildPlaceholder();
      } catch (e) {
        warnings.push(`ERREUR dans build() : ${(e as Error).message}`);
        obj = buildPlaceholder();
      }
      this.current.add(obj);
      if (def.animate && def.status === 'done') this.animateFn = (dt, t) => def.animate!(obj, dt, t);
      colliders = def.colliders ?? (def.status === 'placeholder' || !def.build ? [{ kind: 'circle', x: 0, z: 0, r: 2.2 }] : []);
      // Sujet photo, zone dégagée, tampons de terrain
      const [fx, fy, fz] = def.photo.focus;
      const fyAbs = ctx.groundAt(fx, fz) + fy;
      const focus = new THREE.Mesh(new THREE.SphereGeometry(def.photo.radius, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffd400, wireframe: true, transparent: true, opacity: 0.6 }));
      focus.position.set(fx, fyAbs, fz);
      this.overlays.add(focus, ring(def.clearRadius, 0xffffff), ring(def.photo.minDistance, 0xffd400, fx, fz, true), ring(def.photo.maxDistance, 0xffd400, fx, fz, true));
      for (const s of def.terrain ?? []) this.overlays.add(ring(s.radius, 0x8a6a45, s.dx ?? 0, s.dz ?? 0, true));
      lines.push(`Statut : ${def.status === 'done' ? 'modélisé' : 'PROVISOIRE (cairn)'} · importance : ${def.tier}`);
      lines.push(`Photo : sujet à ${fy} u du sol, rayon ${def.photo.radius} u, distance ${def.photo.minDistance}–${def.photo.maxDistance} u`);
      lines.push(`Zone dégagée : ${def.clearRadius} u · obstacles : ${colliders.length}`);
      if (def.status === 'done' && colliders.length === 0) warnings.push('Aucun obstacle (colliders) : le joueur traversera le modèle.');
    } else if (kind === 'vehicle') {
      const def = VEHICLES.find((v) => v.id === id);
      if (!def) return this.onInfo({ title: `Inconnu : ${id}`, lines: [], warnings: [] });
      title = def.name;
      const world = stubWorld();
      const player = new Player(world, DEFAULT_CUSTOMIZATION);
      player.enterVehicle(def, 0, 0);
      const sheep = new Sheep(world, 'Paddy', DEFAULT_CUSTOMIZATION.sheepAccessory, DEFAULT_CUSTOMIZATION.sheepAccessoryColor);
      if (def.sheepSeat && player.vehicleModel) sheep.sitIn(player.vehicleModel, def.sheepSeat.offset, def.sheepSeat.scale, def.sheepSeat.pose);
      else sheep.placeNear(2, -2);
      this.current.add(player.root, sheep.root);
      const camPos = this.camera.position;
      this.animateFn = (dt) => {
        player.showcase(dt, this.opts.speed); // pose du pilote + animation du véhicule, sans déplacement
        sheep.update(dt, player, camPos);
      };
      colliders = [{ kind: 'circle', x: 0, z: 0, r: def.radius }];
      lines.push(`Prix : ${def.price} · milieu : ${def.medium} · vitesse max ${def.maxSpeed} u/s · pente max ${def.maxSlope}`);
      const v3 = (a: number[]) => a.map((n) => +n.toFixed(2)).join(', ');
      lines.push(`Pilote : pose "${def.rider.pose}" en [${v3(def.rider.offset)}] · mouton : ${def.sheepSeat ? `${def.sheepSeat.pose ?? 'sit'} en [${v3(def.sheepSeat.offset)}]` : 'court à côté'}`);
      lines.push('Règle le curseur "Vitesse" pour voir l’animation.');
    } else if (kind === 'station') {
      title = 'Gare';
      this.current.add(buildStation());
      colliders = STATION_LAYOUT.colliders;
      const a = STATION_LAYOUT.arrival;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), new THREE.MeshBasicMaterial({ color: 0x1f6fb2 }));
      m.position.set(a.x, 0.75, a.z);
      this.overlays.add(m);
      lines.push('Cône bleu : point d’arrivée du joueur. Le quai et la voie sont côté +Z.');
    } else if (kind === 'gate') {
      title = 'Barrière de zone';
      this.current.add(buildGateModel());
      lines.push('Posée automatiquement sur chaque route qui franchit une frontière de zone fermée.');
    }

    for (const c of colliders) this.overlays.add(colliderOutline(c));
    this.current.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
    });

    // Statistiques : triangles + encombrement
    let tris = 0;
    this.current.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const g = m.geometry;
      const n = g.index ? g.index.count / 3 : (g.getAttribute('position')?.count ?? 0) / 3;
      tris += n * ((m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : 1);
    });
    const box = new THREE.Box3().setFromObject(this.current);
    const size = box.getSize(new THREE.Vector3());
    lines.unshift(`Taille : ${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} u (L × H × P) · ${Math.round(tris)} triangles`);
    if (tris > 8000) warnings.push(`${Math.round(tris)} triangles : lourd pour l’iPad (vise < 6000, InstancedMesh si répétitif).`);

    this.placeGauges(box);
    this.frame(box);
    this.overlays.visible = this.opts.overlays;
    this.gauges.visible = this.opts.gauges;
    this.onInfo({ title, lines, warnings });
  }

  setOptions(o: Partial<AtelierOptions>) {
    this.opts = { ...this.opts, ...o };
    this.overlays.visible = this.opts.overlays;
    this.gauges.visible = this.opts.gauges;
  }

  /** Personnage + mouton posés à gauche du modèle, pour l'échelle. */
  private placeGauges(box: THREE.Box3) {
    disposeTree(this.gauges);
    this.gauges.clear();
    const x = Math.min(-2, box.min.x - 2);
    const human = buildCharacter(DEFAULT_CUSTOMIZATION).root;
    human.position.set(x, 0, 0);
    human.rotation.y = Math.PI / 4;
    const sheep = buildSheep(DEFAULT_CUSTOMIZATION.sheepAccessory, DEFAULT_CUSTOMIZATION.sheepAccessoryColor).root;
    sheep.position.set(x - 1.8, 0, 0.6);
    sheep.rotation.y = Math.PI / 3;
    this.gauges.add(human, sheep);
  }

  private frame(box: THREE.Box3) {
    const c = box.getCenter(new THREE.Vector3());
    const r = Math.max(3, box.getSize(new THREE.Vector3()).length() / 2);
    this.controls.target.copy(c);
    this.camera.position.set(c.x + r * 1.4, c.y + r * 0.9, c.z + r * 1.6);
    this.camera.far = Math.max(500, r * 20);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private clear() {
    this.animateFn = null;
    disposeTree(this.current);
    disposeTree(this.overlays);
    this.current.clear();
    this.overlays.clear();
  }

  // --------------------------------------------------------------- boucle
  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    try {
      this.animateFn?.(dt, this.time);
    } catch (e) {
      console.error('[atelier] erreur d’animation', e);
      this.animateFn = null;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.controls.dispose();
    this.renderer.dispose();
  }
}

/** Libère géométries et matériaux propres à l'atelier (jamais les matériaux partagés du jeu). */
function disposeTree(root: THREE.Object3D) {
  const shared = new Set<THREE.Material>(Object.values(sharedMaterials()));
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!(m.isMesh || (o as THREE.Line).isLine)) return;
    if (!m.userData.sharedGeometry) m.geometry.dispose();
    if ((m as THREE.InstancedMesh).isInstancedMesh) (m as THREE.InstancedMesh).dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) if (!shared.has(mat)) mat.dispose();
  });
}

/** Cercle horizontal (zone dégagée, distances photo, tampons de terrain). */
function ring(r: number, color: number, x = 0, z = 0, dashed = false) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(x + Math.cos(a) * r, 0.05, z + Math.sin(a) * r));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 1, gapSize: 0.8 }) : new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geo, mat);
  if (dashed) line.computeLineDistances();
  return line;
}

/** Contour rouge d'un obstacle (cercle ou boîte tournée). */
function colliderOutline(c: ColliderShape) {
  const pts: THREE.Vector3[] = [];
  if (c.kind === 'circle') {
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      pts.push(new THREE.Vector3(c.x + Math.cos(a) * c.r, 0.08, c.z + Math.sin(a) * c.r));
    }
  } else {
    const cs = Math.cos(c.rot);
    const sn = Math.sin(c.rot);
    for (const [lx, lz] of [
      [-c.hw, -c.hd],
      [c.hw, -c.hd],
      [c.hw, c.hd],
      [-c.hw, c.hd],
      [-c.hw, -c.hd],
    ])
      pts.push(new THREE.Vector3(c.x + lx * cs + lz * sn, 0.08, c.z - lx * sn + lz * cs));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xe03030 }));
}
