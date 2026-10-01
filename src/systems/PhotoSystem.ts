/**
 * PhotoSystem — le cœur du gameplay.
 *   evaluate() : quel monument est dans le cadre, et avec quelle qualité ?
 *   capture()  : enregistre l'image du canvas + calcule les étoiles.
 *
 * Règles de notation (modifiables ici et dans config PHOTO) :
 *   - le point focal du monument doit être dans le cadre, devant la caméra,
 *     entre minDistance et maxDistance, et non caché par le relief ni par un
 *     obstacle (maison, arbre… approximés par leurs collisions, hauteur ~5 u) ;
 *   - qualité = taille du sujet dans l'image (60 %) + centrage (40 %) ;
 *   - ★ = valide, ★★ = qualité > 0.55, ★★★ = qualité > 0.8 ;
 *   - bonus "heure dorée" (+0.15) pendant PHOTO.GOLDEN_HOURS ou bestHours du monument.
 */
import * as THREE from 'three';
import { PHOTO } from '../config/gameConfig';
import { clamp } from '../core/math';
import { Heightfield } from '../world/Heightfield';
import { Colliders } from '../world/Colliders';
import { LandmarkManager, PlacedLandmark } from './LandmarkManager';

export interface PhotoEval {
  landmark: PlacedLandmark | null;
  quality: number;
  stars: number;
  withSheep: boolean;
}

const tmp = new THREE.Vector3();
const ndc = new THREE.Vector3();

export class PhotoSystem {
  constructor(
    private hf: Heightfield,
    private landmarks: LandmarkManager,
    private colliders: Colliders,
  ) {}

  evaluate(camera: THREE.PerspectiveCamera, hour: number, sheepPos: THREE.Vector3 | null): PhotoEval {
    camera.updateMatrixWorld();
    const camPos = camera.position;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let best: PhotoEval = { landmark: null, quality: 0, stars: 0, withSheep: false };

    for (const p of this.landmarks.placed) {
      const ph = p.def.photo;
      if (Math.abs(p.x - camPos.x) > ph.maxDistance || Math.abs(p.z - camPos.z) > ph.maxDistance) continue;
      const focus = this.landmarks.focusOf(p, tmp);
      const dist = focus.distanceTo(camPos);
      if (dist < ph.minDistance || dist > ph.maxDistance) continue;
      ndc.copy(focus).project(camera);
      if (ndc.z > 1 || Math.abs(ndc.x) > 0.95 || Math.abs(ndc.y) > 0.95) continue;
      if (this.occluded(camPos, focus) || this.blockedByObjects(camPos, focus, `landmark:${p.def.id}`)) continue;

      const size = ph.radius / (dist * tanHalf); // fraction de la demi-hauteur d'écran
      const sizeScore = clamp(size / PHOTO.IDEAL_SUBJECT_SIZE, 0, 1) * (size > 1.6 ? 0.7 : 1);
      if (size < PHOTO.MIN_SUBJECT_SIZE) continue;
      const centerScore = 1 - clamp(Math.max(Math.abs(ndc.x), Math.abs(ndc.y)) / 0.95, 0, 1);
      let quality = sizeScore * 0.6 + centerScore * 0.4;
      if (this.isGolden(hour, ph.bestHours)) quality += 0.15;
      quality = clamp(quality, 0, 1);
      if (quality > best.quality) best = { landmark: p, quality, stars: 0, withSheep: false };
    }

    if (best.landmark) best.stars = best.quality > 0.8 ? 3 : best.quality > 0.55 ? 2 : 1;
    if (sheepPos) {
      ndc.set(sheepPos.x, sheepPos.y + 0.8, sheepPos.z).project(camera);
      const d = sheepPos.distanceTo(camPos);
      best.withSheep = ndc.z < 1 && Math.abs(ndc.x) < 0.9 && Math.abs(ndc.y) < 0.9 && d < 25;
    }
    return best;
  }

  /** Heure dorée générale OU heures spéciales du monument. */
  isGolden(hour: number, best?: [number, number]) {
    const inRange = ([a, b]: [number, number]) => hour >= a && hour <= b;
    return PHOTO.GOLDEN_HOURS.some(inRange) || (!!best && inRange(best));
  }

  /** Le relief cache-t-il le sujet ? (échantillonnage le long du rayon) */
  private occluded(from: THREE.Vector3, to: THREE.Vector3) {
    const N = 16;
    for (let i = 2; i < N - 1; i++) {
      const t = i / N;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const z = from.z + (to.z - from.z) * t;
      if (this.hf.heightAt(x, z) > y + 0.8) return true;
    }
    return false;
  }

  /** Un obstacle (maison, arbre…) se trouve-t-il sur la ligne de visée ? */
  private blockedByObjects(from: THREE.Vector3, to: THREE.Vector3, targetOwner: string) {
    const OBJECT_HEIGHT = 5;
    const N = 24;
    let hits = 0;
    for (let i = 1; i < N - 1; i++) {
      const t = i / N;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const z = from.z + (to.z - from.z) * t;
      if (y - this.hf.heightAt(x, z) > OBJECT_HEIGHT) continue;
      if (this.colliders.blocked(x, z, 0.05, targetOwner)) hits++;
      if (hits >= 2) return true;
    }
    return false;
  }

  /**
   * Capture l'image du canvas (À APPELER JUSTE APRÈS renderer.render, dans la
   * même frame, sinon l'image est noire) et la réduit en miniature JPEG.
   */
  captureCanvas(canvas: HTMLCanvasElement): string {
    const w = PHOTO.THUMB_WIDTH;
    const h = Math.round((w * canvas.height) / canvas.width);
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0, w, h);
    return off.toDataURL('image/jpeg', PHOTO.JPEG_QUALITY);
  }
}
