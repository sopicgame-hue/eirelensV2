/**
 * Caméra : vue 3/4 plongeante qui suit le joueur (façon Pokémon 3DS),
 * pivotable au stick droit, et vue subjective en mode photo.
 *
 * yaw = θ ⇔ la caméra REGARDE dans la direction (sin θ, cos θ).
 */
import * as THREE from 'three';
import { CAMERA, PHOTO, PLAYER } from '../config/gameConfig';
import { clamp, damp, dampAngle } from '../core/math';
import { Heightfield } from '../world/Heightfield';
import { Input } from '../input/Input';

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  yaw = Math.PI;
  pitch = CAMERA.PITCH;
  distance = CAMERA.DISTANCE;
  /** Mode photo : orientation libre. */
  photoYaw = 0;
  photoPitch = 0;
  fov = CAMERA.FOV;
  private target = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private idleLook = 0;
  invertY = false;

  constructor(
    aspect: number,
    private hf: Heightfield,
  ) {
    this.camera = new THREE.PerspectiveCamera(CAMERA.FOV, aspect, CAMERA.NEAR, CAMERA.FAR);
  }

  snapTo(pos: THREE.Vector3, heading: number) {
    this.yaw = heading;
    this.target.set(pos.x, pos.y + 1.2, pos.z);
  }

  /** Vue 3/4 classique. preferredDistance : distance conseillée (véhicule). */
  updateFollow(
    dt: number,
    look: { x: number; y: number },
    zoom: number,
    focus: THREE.Vector3,
    heading: number,
    moving: boolean,
    preferredDistance: number,
    autoAlign: boolean,
    /** Force une distance (ex : écran de personnalisation). */
    forcedDistance?: number,
  ) {
    const lookX = look.x;
    const lookY = look.y * (this.invertY ? -1 : 1);
    this.yaw -= lookX * CAMERA.ROTATE_SPEED * dt;
    this.pitch = clamp(this.pitch - lookY * CAMERA.ROTATE_SPEED * 0.6 * dt, CAMERA.MIN_PITCH, CAMERA.MAX_PITCH);
    this.distance = clamp(this.distance - zoom * 8 * dt, CAMERA.MIN_DISTANCE, CAMERA.MAX_DISTANCE);

    // En véhicule : la caméra se replace doucement derrière (si on ne la touche pas)
    this.idleLook = Math.abs(lookX) + Math.abs(lookY) > 0.05 ? 0 : this.idleLook + dt;
    if (autoAlign && moving && this.idleLook > 1.2) this.yaw = dampAngle(this.yaw, heading, 1.5, dt);

    const wantDist = forcedDistance ?? Math.max(this.distance, preferredDistance);
    const pitch = forcedDistance ? 0.25 : this.pitch;
    this.target.x = damp(this.target.x, focus.x, CAMERA.FOLLOW_LERP * 2, dt);
    this.target.y = damp(this.target.y, focus.y + 1.2, CAMERA.FOLLOW_LERP, dt);
    this.target.z = damp(this.target.z, focus.z, CAMERA.FOLLOW_LERP * 2, dt);

    const cp = Math.cos(pitch);
    const cam = this.camera.position;
    cam.set(
      this.target.x - Math.sin(this.yaw) * wantDist * cp,
      this.target.y + Math.sin(pitch) * wantDist,
      this.target.z - Math.cos(this.yaw) * wantDist * cp,
    );
    // Ne jamais passer sous le relief
    const ground = this.hf.heightAt(cam.x, cam.z);
    if (cam.y < ground + 1.2) cam.y = ground + 1.2;
    // On vise un peu au-dessus du joueur : il est plus bas à l'écran et on voit l'horizon
    this.lookTarget.copy(this.target);
    this.lookTarget.y += forcedDistance ? 0 : CAMERA.LOOK_UP;
    this.camera.lookAt(this.lookTarget);
    this.setFov(damp(this.camera.fov, CAMERA.FOV, 6, dt));
  }

  /** Rotation directe (souris, glisser tactile) en radians — indépendante des FPS. */
  applyLookDelta(dx: number, dy: number, photo: boolean) {
    if (dx === 0 && dy === 0) return;
    const iy = this.invertY ? -1 : 1;
    if (photo) {
      const z = this.fov / 50; // plus on zoome, plus c'est fin
      this.photoYaw -= dx * z;
      this.photoPitch = clamp(this.photoPitch - dy * iy * z, -1.2, 1.3);
    } else {
      this.yaw -= dx;
      this.pitch = clamp(this.pitch + dy * iy * 0.6, CAMERA.MIN_PITCH, CAMERA.MAX_PITCH);
      this.idleLook = 0;
    }
  }

  /** Entre en mode photo en regardant dans la direction du joueur. */
  enterPhoto(heading: number) {
    this.photoYaw = heading;
    this.photoPitch = 0.05;
    this.fov = 50;
  }

  updatePhoto(dt: number, input: Input, eye: THREE.Vector3) {
    const lookX = input.look.x + input.move.x * 0.6;
    const lookY = (input.look.y + input.move.y * 0.6) * (this.invertY ? -1 : 1);
    const zoomFactor = this.fov / 50;
    this.photoYaw -= lookX * PHOTO.LOOK_SPEED * zoomFactor * dt;
    this.photoPitch = clamp(this.photoPitch + lookY * PHOTO.LOOK_SPEED * zoomFactor * dt, -1.2, 1.3);
    this.fov = clamp(this.fov - input.zoom * PHOTO.ZOOM_SPEED * dt, PHOTO.MIN_FOV, PHOTO.MAX_FOV);
    this.camera.position.set(eye.x, eye.y + PLAYER.EYE_HEIGHT, eye.z);
    const cp = Math.cos(this.photoPitch);
    this.lookTarget.set(Math.sin(this.photoYaw) * cp, Math.sin(this.photoPitch), Math.cos(this.photoYaw) * cp).add(this.camera.position);
    this.camera.lookAt(this.lookTarget);
    this.setFov(this.fov);
  }

  /** Après le mode photo : la caméra 3/4 reprend l'orientation visée. */
  exitPhoto() {
    this.yaw = this.photoYaw;
  }

  private setFov(f: number) {
    if (Math.abs(this.camera.fov - f) > 0.01) {
      this.camera.fov = f;
      this.camera.updateProjectionMatrix();
    }
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
