/**
 * Sheep — le mouton de compagnie : suit le joueur, broute, parle, se fait
 * chevaucher, monte dans les véhicules et… s'incruste dans les photos.
 *
 * États :
 *   follow    : suit le joueur (marche / court / se téléporte s'il est semé)
 *   ridden    : le joueur est sur son dos (position = celle du joueur)
 *   seated    : assis dans un véhicule (attaché au modèle du véhicule)
 *   photobomb : court se placer dans le cadre de la photo et saute partout
 */
import * as THREE from 'three';
import { SHEEP } from '../config/gameConfig';
import { damp, dampAngle, wrapAngle } from '../core/math';
import { events } from '../core/events';
import { buildSheep, disposeSheep, SheepRig } from '../models/sheepModel';
import { SheepAccessoryId } from '../content/customization';
import { sheepLine, SheepTrigger } from '../content/sheepLines';
import { moveEntity, findNearest, MoveParams, WorldRefs } from './movement';
import type { Player } from './Player';

export type SheepState = 'follow' | 'ridden' | 'seated' | 'photobomb';

const PARAMS: MoveParams = { radius: 0.5, maxSlope: 1.4, medium: 'land', maxWade: 0.3 };

export class Sheep {
  readonly root = new THREE.Group();
  rig: SheepRig;
  readonly pos = new THREE.Vector3();
  heading = 0;
  speed = 0;
  state: SheepState = 'follow';
  name: string;
  private phase = 0;
  private time = 0;
  private stuckTime = 0;
  private hop = 0;
  private graze = 0;
  private chatter = SHEEP.CHATTER_INTERVAL * 0.6;
  private bombTarget = new THREE.Vector3();
  private bombTime = 0;
  private lastLine = 0;
  private rideTime = 0;
  /** Renseigné par Game à chaque frame (répliques nocturnes). */
  isNight = false;

  constructor(
    private world: WorldRefs,
    name: string,
    accessory: SheepAccessoryId,
    accessoryColor: number,
  ) {
    this.name = name;
    this.root.name = 'sheepRoot';
    this.rig = buildSheep(accessory, accessoryColor);
    this.root.add(this.rig.root);
  }

  setAccessory(accessory: SheepAccessoryId, color: number) {
    const parent = this.rig.root.parent ?? this.root;
    parent.remove(this.rig.root);
    disposeSheep(this.rig);
    this.rig = buildSheep(accessory, color);
    parent.add(this.rig.root);
  }

  /** Fait parler le mouton (anti-spam : 4 s minimum entre deux répliques, sauf force). */
  say(trigger: SheepTrigger, force = false) {
    if (!force && this.time - this.lastLine < 4) return;
    this.lastLine = this.time;
    events.emit('sheepSays', { text: sheepLine(trigger, this.name) });
  }

  /** Petit saut de joie. */
  jump() {
    this.hop = 1;
  }

  placeNear(x: number, z: number) {
    const p = findNearest(this.world, x, z, PARAMS, 15);
    const tx = p?.x ?? x;
    const tz = p?.z ?? z;
    this.pos.set(tx, this.world.hf.heightAt(tx, tz), tz);
  }

  // ------------------------------------------------------------ véhicules
  sitIn(vehicleModel: THREE.Object3D, offset: [number, number, number], scale = 1) {
    this.state = 'seated';
    this.rig.root.parent?.remove(this.rig.root);
    vehicleModel.add(this.rig.root);
    this.rig.root.position.set(offset[0], offset[1] - 0.62 * scale, offset[2]);
    this.rig.root.rotation.set(0, 0, 0);
    this.rig.root.scale.setScalar(scale);
  }

  standUp(x: number, z: number) {
    this.rig.root.parent?.remove(this.rig.root);
    this.rig.root.scale.setScalar(1);
    this.root.add(this.rig.root);
    this.state = 'follow';
    this.placeNear(x, z);
  }

  startPhotobomb(spot: THREE.Vector3) {
    if (this.state !== 'follow') return;
    const p = findNearest(this.world, spot.x, spot.z, PARAMS, 4);
    if (!p) return;
    this.state = 'photobomb';
    this.bombTarget.set(p.x, 0, p.z);
    this.bombTime = 0;
  }

  /** Fin du mode photo : le mouton arrête son numéro et revient. */
  stopPhotobomb() {
    if (this.state === 'photobomb') this.state = 'follow';
  }

  get isPhotobombing() {
    return this.state === 'photobomb' && this.bombTime > 0.8;
  }

  // ------------------------------------------------------------- update
  update(dt: number, player: Player, cameraPos: THREE.Vector3) {
    this.time += dt;
    this.hop = Math.max(0, this.hop - dt * 1.6);

    if (this.state === 'seated') {
      this.rig.root.getWorldPosition(this.pos); // position réelle à bord (pour la photo, la distance…)
      this.animate(dt, 0);
      return;
    }
    if (this.state === 'ridden') {
      this.rideTime += dt;
      if (this.rideTime > 25 && Math.random() < dt * 0.05) this.say('rideLong');
      this.pos.copy(player.pos);
      this.heading = player.heading;
      this.speed = player.speed;
      this.applyTransform();
      this.animate(dt, this.speed);
      return;
    }
    this.rideTime = 0;

    let tx: number;
    let tz: number;
    let run = false;
    if (this.state === 'photobomb') {
      this.bombTime += dt;
      tx = this.bombTarget.x;
      tz = this.bombTarget.z;
      run = true;
      if (this.bombTime > 1 && Math.hypot(tx - this.pos.x, tz - this.pos.z) < 1) {
        if (this.hop <= 0) this.hop = 1;
        this.heading = dampAngle(this.heading, Math.atan2(cameraPos.x - this.pos.x, cameraPos.z - this.pos.z), 8, dt);
      }
      if (this.bombTime > 6) this.state = 'follow';
    } else {
      // Se place derrière le joueur, légèrement sur le côté (visible par la caméra)
      const side = 0.9;
      tx = player.pos.x - Math.sin(player.heading) * SHEEP.FOLLOW_DISTANCE + Math.cos(player.heading) * side;
      tz = player.pos.z - Math.cos(player.heading) * SHEEP.FOLLOW_DISTANCE - Math.sin(player.heading) * side;
      const dPlayer = player.pos.distanceTo(this.pos);
      run = dPlayer > SHEEP.CATCHUP_DISTANCE;
      if (dPlayer > SHEEP.TELEPORT_DISTANCE || this.stuckTime > 2.5) {
        this.placeNear(tx, tz);
        this.stuckTime = 0;
        if (dPlayer > SHEEP.TELEPORT_DISTANCE * 0.8 && Math.random() < 0.5) this.say('teleport');
      }
    }

    const dx = tx - this.pos.x;
    const dz = tz - this.pos.z;
    const dist = Math.hypot(dx, dz);
    let targetSpeed = 0;
    if (dist > 0.6) targetSpeed = run ? SHEEP.RUN_SPEED : Math.min(SHEEP.WALK_SPEED * 1.2, dist * 2.5);
    this.speed = damp(this.speed, targetSpeed, 6, dt);
    if (this.speed > 0.2 && dist > 0.01) {
      this.heading = dampAngle(this.heading, Math.atan2(dx, dz), 8, dt);
      const step = Math.min(dist, this.speed * dt);
      const r = moveEntity(this.world, this.pos.x, this.pos.z, (dx / dist) * step, (dz / dist) * step, PARAMS);
      const moved = Math.hypot(r.x - this.pos.x, r.z - this.pos.z);
      this.stuckTime = moved < step * 0.2 && dist > 2 ? this.stuckTime + dt : 0;
      this.pos.x = r.x;
      this.pos.z = r.z;
      this.graze = 0;
    } else if (this.state === 'follow') {
      // Au repos : regarde le joueur, broute parfois, papote
      const toPlayer = Math.atan2(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
      if (Math.abs(wrapAngle(toPlayer - this.heading)) > 1.2) this.heading = dampAngle(this.heading, toPlayer, 2, dt);
      this.graze += dt;
      this.chatter -= dt;
      if (this.chatter <= 0) {
        this.chatter = SHEEP.CHATTER_INTERVAL * (0.6 + Math.random() * 0.8);
        this.say(this.isNight && Math.random() < 0.5 ? 'night' : 'idle');
      }
    }
    this.pos.y = Math.max(this.world.hf.heightAt(this.pos.x, this.pos.z), -0.3);
    this.applyTransform();
    this.animate(dt, this.speed);
  }

  private applyTransform() {
    const root = this.rig.root;
    root.position.set(this.pos.x, this.pos.y + Math.sin(this.hop * Math.PI) * 0.8, this.pos.z);
    root.rotation.y = this.heading;
  }

  private animate(dt: number, speed: number) {
    const r = this.rig;
    this.phase += speed * dt * 2.6;
    const gallop = Math.min(1, speed / 6);
    const s = Math.sin(this.phase);
    r.legs[0].rotation.x = s * 0.8 * gallop;
    r.legs[3].rotation.x = s * 0.8 * gallop;
    r.legs[1].rotation.x = -s * 0.8 * gallop;
    r.legs[2].rotation.x = -s * 0.8 * gallop;
    if (this.state === 'seated') r.legs.forEach((l) => (l.rotation.x = -1.2));
    r.body.position.y = 0.62 + Math.abs(Math.cos(this.phase)) * 0.08 * gallop + Math.sin(this.time * 2.2) * 0.01;
    const grazing = this.graze > 3 && Math.sin(this.time * 0.3) > 0.2;
    r.head.rotation.x = damp(r.head.rotation.x, grazing ? 0.9 : 0, 4, dt);
    r.tail.rotation.y = Math.sin(this.time * (speed > 1 ? 18 : 5)) * 0.4;
  }

  dispose() {
    disposeSheep(this.rig);
  }
}
