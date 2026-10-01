/**
 * Player — le personnage : déplacement, modes (à pied / sur le mouton /
 * en véhicule), animations procédurales.
 *
 * Convention d'orientation : heading = θ  ⇔  avant = (sin θ, cos θ) en (x, z),
 * identique à object.rotation.y de three.js.
 */
import * as THREE from 'three';
import { PLAYER, WORLD } from '../config/gameConfig';
import { damp, dampAngle, wrapAngle } from '../core/math';
import { Input } from '../input/Input';
import { Customization } from '../content/customization';
import { VehicleDef } from '../content/vehicles/types';
import { buildCharacter, CharacterRig, disposeCharacter } from '../models/characterModel';
import { moveEntity, MoveParams, WorldRefs } from './movement';

export type PlayerMode = 'foot' | 'ride' | 'vehicle';

/** Distances d'anticipation du relief pour l'altitude du ULM (u). */
const LOOK_AHEAD = [10, 25, 45];

const FOOT: MoveParams = { radius: PLAYER.RADIUS, maxSlope: PLAYER.MAX_SLOPE, medium: 'land', maxWade: PLAYER.MAX_WADE_DEPTH };

export class Player {
  readonly pos = new THREE.Vector3();
  heading = 0;
  speed = 0;
  mode: PlayerMode = 'foot';
  vehicle: VehicleDef | null = null;
  vehicleModel: THREE.Object3D | null = null;
  photoMode = false;
  /** Distance parcourue (statistiques). */
  distance = 0;
  /** Le joueur vient de se cogner (pour un petit effet / son). */
  bumped = false;
  /** Le joueur vient de buter contre le mur d'une zone verrouillée. */
  zoneBlocked = false;
  /** ULM : en vol (sinon il roule au sol). */
  airborne = false;
  rig: CharacterRig;
  readonly root = new THREE.Group();
  private vel = new THREE.Vector2();
  private animPhase = 0;
  private time = 0;

  constructor(
    private world: WorldRefs,
    custom: Customization,
  ) {
    this.root.name = 'playerRoot';
    this.rig = buildCharacter(custom);
    this.root.add(this.rig.root);
  }

  setCustomization(c: Customization) {
    const old = this.rig.root;
    const parent = old.parent ?? this.root;
    parent.remove(old);
    disposeCharacter(this.rig);
    this.rig = buildCharacter(c);
    // Garder la place exacte (ex : siège du véhicule, pose cachée)
    this.rig.root.position.copy(old.position);
    this.rig.root.rotation.copy(old.rotation);
    this.rig.root.visible = old.visible;
    parent.add(this.rig.root);
  }

  teleport(x: number, z: number, heading = this.heading) {
    this.pos.set(x, this.world.hf.heightAt(x, z), z);
    this.heading = heading;
    this.vel.set(0, 0);
    this.speed = 0;
  }

  /** Paramètres de déplacement du mode courant. */
  private params(): MoveParams {
    if (this.mode === 'vehicle' && this.vehicle) {
      const v = this.vehicle;
      // ULM : 'air' en vol, terrestre quand il roule au sol
      const medium = v.medium === 'air' ? (this.airborne ? 'air' : 'land') : v.medium;
      return { radius: v.radius, maxSlope: v.maxSlope, medium, maxWade: 0.15 };
    }
    if (this.mode === 'ride') return { ...FOOT, radius: 0.6 };
    return FOOT;
  }

  /**
   * @param camYaw  orientation de la caméra (pour les commandes relatives à l'écran)
   * @param enabled false = pas de contrôle (menus, mode photo)
   */
  update(dt: number, input: Input, camYaw: number, enabled: boolean) {
    this.time += dt;
    this.bumped = false;
    this.zoneBlocked = false;
    // ULM en vol + menu / appareil photo ouvert : il reste en l'air, immobile (pause photo)
    if (!enabled && this.airborne) {
      this.speed = 0;
      this.updateVisuals(dt);
      return;
    }
    const mx = enabled ? input.move.x : 0;
    const my = enabled ? input.move.y : 0;
    const mag = Math.min(1, Math.hypot(mx, my));
    // Direction voulue, relative à la caméra
    const fx = Math.sin(camYaw);
    const fz = Math.cos(camYaw);
    const dirX = fx * my - fz * mx;
    const dirZ = fz * my + fx * mx;
    const p = this.params();

    let dx = 0;
    let dz = 0;
    if (this.mode === 'vehicle' && this.vehicle) {
      const v = this.vehicle;
      if (mag > 0.1) {
        const target = Math.atan2(dirX, dirZ);
        const diff = wrapAngle(target - this.heading);
        const maxTurn = v.turnRate * dt * (0.4 + 0.6 * Math.min(1, this.speed / (v.maxSpeed * 0.3) + 0.3));
        this.heading = wrapAngle(this.heading + Math.max(-maxTurn, Math.min(maxTurn, diff)));
        const align = Math.max(0, Math.cos(diff));
        this.speed = approach(this.speed, v.maxSpeed * mag * (0.35 + 0.65 * align), v.acceleration * dt);
      } else {
        this.speed = approach(this.speed, 0, v.acceleration * 1.5 * dt);
      }
      if (v.medium === 'air' && v.flight) this.updateFlightState(v.flight.takeoffSpeed, mag);
      dx = Math.sin(this.heading) * this.speed * dt;
      dz = Math.cos(this.heading) * this.speed * dt;
    } else {
      const max = this.mode === 'ride' ? PLAYER.SHEEP_RIDE_SPEED : PLAYER.WALK_SPEED;
      const tx = dirX * max * mag;
      const tz = dirZ * max * mag;
      const a = PLAYER.ACCELERATION * dt;
      this.vel.x = approach(this.vel.x, tx, a);
      this.vel.y = approach(this.vel.y, tz, a);
      this.speed = this.vel.length();
      if (mag > 0.1) this.heading = dampAngle(this.heading, Math.atan2(dirX, dirZ), PLAYER.TURN_SPEED, dt);
      dx = this.vel.x * dt;
      dz = this.vel.y * dt;
    }

    if (dx !== 0 || dz !== 0) {
      const r = moveEntity(this.world, this.pos.x, this.pos.z, dx, dz, p);
      const moved = Math.hypot(r.x - this.pos.x, r.z - this.pos.z);
      this.distance += moved;
      if (r.zoneBlocked) this.zoneBlocked = true;
      if (r.blocked && moved < Math.hypot(dx, dz) * 0.3) {
        this.bumped = true;
        if (this.mode === 'vehicle') this.speed *= 0.5;
        else this.vel.multiplyScalar(0.5);
      }
      this.pos.x = r.x;
      this.pos.z = r.z;
    }
    const ground = this.world.hf.heightAt(this.pos.x, this.pos.z);
    const targetY = p.medium === 'water' ? WORLD.WATER_LEVEL : Math.max(ground, WORLD.WATER_LEVEL - PLAYER.MAX_WADE_DEPTH);
    if (this.mode === 'vehicle' && this.vehicle?.flight) this.updateAltitude(dt, ground, this.vehicle.flight);
    else this.pos.y = this.mode === 'vehicle' ? damp(this.pos.y, targetY, 12, dt) : targetY;

    this.updateVisuals(dt);
  }

  // ------------------------------------------------------------------ vol
  /** Décollage / atterrissage du ULM selon la vitesse et le sol en dessous. */
  private updateFlightState(takeoffSpeed: number, stick: number) {
    const overWater = this.world.hf.heightAt(this.pos.x, this.pos.z) < WORLD.WATER_LEVEL + 0.3;
    if (!this.airborne && this.speed >= takeoffSpeed) this.airborne = true;
    if (!this.airborne) return;
    const canLand = !overWater && this.world.hf.slopeAt(this.pos.x, this.pos.z) < (this.vehicle?.maxSlope ?? 0.5);
    if (canLand && stick < 0.1 && this.speed < takeoffSpeed * 0.5) this.airborne = false; // atterrissage
    else if (!canLand) this.speed = Math.max(this.speed, takeoffSpeed * 0.6); // on ne s'arrête pas en l'air
  }

  /** Altitude du ULM : suit le relief (avec anticipation) à la hauteur de croisière. */
  private updateAltitude(dt: number, ground: number, f: { cruiseHeight: number; climbRate: number }) {
    const floor = Math.max(ground, WORLD.WATER_LEVEL);
    if (!this.airborne) {
      // Au sol (ou en train d'atterrir) : descente douce jusqu'au sol
      this.pos.y = this.pos.y > floor + 0.05 ? Math.max(floor, this.pos.y - f.climbRate * dt) : floor;
      return;
    }
    let ahead = floor;
    const fx = Math.sin(this.heading);
    const fz = Math.cos(this.heading);
    for (const d of LOOK_AHEAD) ahead = Math.max(ahead, this.world.hf.heightAt(this.pos.x + fx * d, this.pos.z + fz * d));
    const target = ahead + f.cruiseHeight;
    const step = f.climbRate * dt;
    this.pos.y = this.pos.y < target ? Math.min(target, this.pos.y + step) : Math.max(target, this.pos.y - step * 0.6);
    this.pos.y = Math.max(this.pos.y, floor + 0.5); // jamais dans le relief
  }

  // ------------------------------------------------------------- véhicules
  enterVehicle(def: VehicleDef, x: number, z: number) {
    this.exitVehicleVisual();
    this.mode = 'vehicle';
    this.airborne = false;
    this.vehicle = def;
    this.vehicleModel = def.build();
    this.vehicleModel.name = `vehicle:${def.id}`;
    this.root.add(this.vehicleModel);
    this.teleport(x, z);
    if (def.medium === 'water') this.pos.y = WORLD.WATER_LEVEL;
    this.root.remove(this.rig.root);
    this.vehicleModel.add(this.rig.root);
    this.rig.root.position.set(...def.rider.offset);
    this.rig.root.rotation.set(0, 0, 0);
    this.rig.root.visible = def.rider.pose !== 'hidden';
  }

  exitVehicle(x: number, z: number) {
    this.exitVehicleVisual();
    this.mode = 'foot';
    this.airborne = false;
    this.vehicle = null;
    this.teleport(x, z);
  }

  private exitVehicleVisual() {
    if (this.vehicleModel) {
      this.vehicleModel.remove(this.rig.root);
      this.root.remove(this.vehicleModel);
      this.vehicleModel.traverse((o) => (o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.dispose());
      this.vehicleModel = null;
    }
    if (this.rig.root.parent !== this.root) this.root.add(this.rig.root);
    this.rig.root.visible = true;
  }

  /** Atelier 3D : anime le véhicule et la pose du pilote à la vitesse donnée, sans rien déplacer. */
  showcase(dt: number, speed: number) {
    this.time += dt;
    this.speed = speed;
    this.updateVisuals(dt);
  }

  // ------------------------------------------------------------ animation
  private updateVisuals(dt: number) {
    const r = this.rig;
    const t = this.time;
    if (this.mode === 'vehicle' && this.vehicleModel && this.vehicle) {
      this.vehicleModel.position.copy(this.pos);
      this.vehicleModel.rotation.y = this.heading;
      this.vehicle.animate?.(this.vehicleModel, this.speed, dt, t);
      this.animPhase += this.speed * dt * 1.6;
      const rp = this.vehicle.rider.pose;
      this.pose(rp === 'bike' ? 'bike' : rp === 'ride' ? 'ride' : 'sit');
      return;
    }
    const root = r.root;
    if (this.mode === 'ride') {
      // Assis sur le mouton (le mouton est placé par Sheep.ts à la même position)
      root.position.set(this.pos.x, this.pos.y + 0.78 + Math.abs(Math.sin(t * 14)) * 0.08, this.pos.z);
      root.rotation.y = this.heading;
      this.pose('sit');
      return;
    }
    root.position.copy(this.pos);
    root.rotation.y = this.heading;
    this.animPhase += this.speed * dt * 2.1;
    if (this.photoMode) this.pose('photo');
    else if (this.speed > 0.3) this.pose('walk');
    else this.pose('idle');
  }

  private pose(kind: 'idle' | 'walk' | 'sit' | 'ride' | 'bike' | 'photo') {
    const r = this.rig;
    const s = Math.sin(this.animPhase);
    const k = Math.min(1, this.speed / PLAYER.WALK_SPEED);
    r.camera.visible = kind === 'photo';
    r.head.rotation.set(0, 0, 0);
    r.armL.rotation.set(0, 0, 0);
    r.armR.rotation.set(0, 0, 0);
    r.legL.rotation.set(0, 0, 0);
    r.legR.rotation.set(0, 0, 0);
    r.torso.position.y = 0.55;
    r.hips.position.y = 0.55;
    switch (kind) {
      case 'walk':
        r.legL.rotation.x = s * 0.75 * k;
        r.legR.rotation.x = -s * 0.75 * k;
        r.armL.rotation.x = -s * 0.65 * k;
        r.armR.rotation.x = s * 0.65 * k;
        r.torso.position.y = 0.55 + Math.abs(Math.cos(this.animPhase)) * 0.04 * k;
        break;
      case 'idle':
        r.torso.position.y = 0.55 + Math.sin(this.time * 2) * 0.006;
        r.head.rotation.y = Math.sin(this.time * 0.4) * 0.25;
        r.armL.rotation.z = 0.08;
        r.armR.rotation.z = -0.08;
        break;
      case 'sit':
        r.legL.rotation.x = -1.35;
        r.legR.rotation.x = -1.35;
        r.legL.rotation.z = 0.25;
        r.legR.rotation.z = -0.25;
        r.armL.rotation.x = -0.9;
        r.armR.rotation.x = -0.9;
        break;
      case 'ride':
        // À califourchon : jambes écartées de part et d'autre de la monture
        r.legL.rotation.set(-0.35, 0, 0.55);
        r.legR.rotation.set(-0.35, 0, -0.55);
        r.armL.rotation.x = -0.8 + Math.sin(this.animPhase) * 0.05;
        r.armR.rotation.x = -0.8 + Math.sin(this.animPhase) * 0.05;
        break;
      case 'bike':
        r.legL.rotation.x = -1.0 + s * 0.5;
        r.legR.rotation.x = -1.0 - s * 0.5;
        r.armL.rotation.x = -1.2;
        r.armR.rotation.x = -1.2;
        r.torso.rotation.x = 0.25;
        break;
      case 'photo':
        r.armL.rotation.set(-1.45, 0, -0.45);
        r.armR.rotation.set(-1.45, 0, 0.45);
        break;
    }
    if (kind !== 'bike') r.torso.rotation.x = 0;
  }

  dispose() {
    disposeCharacter(this.rig);
  }
}

function approach(v: number, target: number, step: number) {
  if (v < target) return Math.min(target, v + step);
  return Math.max(target, v - step);
}
