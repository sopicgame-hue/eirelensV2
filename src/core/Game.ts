/**
 * Game — chef d'orchestre. Crée le monde, les entités et les systèmes, puis
 * fait tourner la boucle : input → logique de l'écran courant → monde → rendu.
 *
 * Règles :
 *   - Game ne contient PAS de logique métier détaillée : il délègue
 *     (Player, Sheep, PhotoSystem, Progression…).
 *   - L'UI React ne touche jamais three.js : elle appelle les méthodes
 *     publiques "COMMANDES UI" en bas de ce fichier, et lit uiStore.
 */
import * as THREE from 'three';
import { RENDER, TIME, SAVE, SHEEP, PLAYER, TERRAIN, STATIONS, ZONE_UI, ECONOMY } from '../config/gameConfig';
import { events } from './events';
import { SaveData, loadSave, writeSave, defaultSave, deleteSave } from './save';
import { savePhoto, clearPhotos } from './photoStore';
import { Input } from '../input/Input';
import { WorldGrid } from '../world/WorldGrid';
import { Heightfield } from '../world/Heightfield';
import { Colliders } from '../world/Colliders';
import { TerrainChunks } from '../world/TerrainChunks';
import { Scatter } from '../world/Scatter';
import { Towns } from '../world/Towns';
import { Water } from '../world/Water';
import { DayNight } from '../world/DayNight';
import { buildRoadMesh } from '../world/Roads';
import { LandmarkManager, landmarkStamps } from '../systems/LandmarkManager';
import { PhotoSystem } from '../systems/PhotoSystem';
import { Progression } from '../systems/Progression';
import { Audio } from '../systems/Audio';
import { Zones } from '../systems/Zones';
import { Stations, stationStamps } from '../systems/Stations';
import { ZoneGates } from '../systems/ZoneGates';
import { updateHud } from '../systems/Hud';
import { Player } from '../entities/Player';
import { Sheep } from '../entities/Sheep';
import { CameraRig } from '../entities/CameraRig';
import { findNearest, WorldRefs } from '../entities/movement';
import { LANDMARKS } from '../content/landmarks';
import { getVehicle, FOOT_ID } from '../content/vehicles';
import { Customization } from '../content/customization';
import { uiStore, Screen } from '../ui/uiStore';
import type { ZoneId } from '../world/data/zones';

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Game {
  readonly input = new Input();
  readonly audio = new Audio();
  save: SaveData = loadSave();
  hour = TIME.START_HOUR;

  renderer!: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  rig!: CameraRig;
  grid!: WorldGrid;
  hf!: Heightfield;
  colliders = new Colliders();
  terrain!: TerrainChunks;
  scatter!: Scatter;
  towns!: Towns;
  water!: Water;
  dayNight!: DayNight;
  landmarks!: LandmarkManager;
  photo!: PhotoSystem;
  progression!: Progression;
  player!: Player;
  sheep!: Sheep;
  zones = new Zones();
  stations!: Stations;
  gates!: ZoneGates;
  /** Références passées à moveEntity / findNearest (relief, obstacles, mur des zones). */
  world!: WorldRefs;

  private raf = 0;
  private last = 0;
  private hudTimer = 0;
  private evalTimer = 0;
  private saveTimer = 0;
  private stepTimer = 0;
  private captureRequested = false;
  private distanceSaved = 0;
  /** "Galoper" n'est pris en compte que s'il a été appuyé EN JEU (B sert aussi à fermer les menus). */
  private runArmed = false;
  private disposed = false;
  private time = 0;
  private eye = new THREE.Vector3();
  private traveling = false;
  /** Zone de chaque lieu (calculée une fois à partir des coordonnées). */
  private landmarkZone = new Map<string, ZoneId>();
  private offEvents: (() => void)[] = [];

  constructor(private canvas: HTMLCanvasElement) {}

  // =================================================================== CHARGEMENT
  async load() {
    const progress = async (p: number, label: string) => {
      uiStore.set({ loading: { progress: p, label } });
      await nextFrame();
    };
    await progress(0.05, 'Dessin des côtes irlandaises…');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.applyQuality();
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.grid = new WorldGrid();
    await progress(0.35, 'Soulèvement des montagnes…');
    this.hf = new Heightfield(this.grid, [...landmarkStamps(LANDMARKS), ...stationStamps()]);
    this.rig = new CameraRig(window.innerWidth / window.innerHeight, this.hf);
    this.rig.invertY = this.save.settings.invertY;
    this.resize();

    await progress(0.5, 'Construction des villages…');
    this.landmarks = new LandmarkManager(LANDMARKS, this.hf, this.colliders);
    for (const p of this.landmarks.placed) this.landmarkZone.set(p.def.id, this.zones.zoneAt(p.x, p.z).id);
    this.stations = new Stations(this.hf, this.colliders);
    const reserved = (x: number, z: number) => this.landmarks.isReserved(x, z) || this.stations.isReserved(x, z);
    this.towns = new Towns(this.hf, this.colliders, reserved);
    this.terrain = new TerrainChunks(this.hf);
    this.applyQuality();
    this.scatter = new Scatter(this.hf, this.colliders, this.terrain, (x, z) => reserved(x, z) || this.towns.isInTown(x, z));
    this.gates = new ZoneGates(this.grid, this.hf, this.zones);

    await progress(0.65, 'Remplissage de l’océan…');
    this.dayNight = new DayNight(this.scene);
    this.water = new Water();
    this.scene.add(this.terrain.group, this.scatter.group, this.towns.group, this.landmarks.group, this.stations.group, this.gates.group, this.water.mesh, buildRoadMesh(this.grid));

    await progress(0.75, 'Réveil de Paddy…');
    this.photo = new PhotoSystem(this.hf, this.landmarks, this.colliders);
    this.progression = this.makeProgression();
    this.world = { hf: this.hf, colliders: this.colliders, canEnter: this.zones.canEnter };
    this.player = new Player(this.world, this.save.customization);
    this.sheep = new Sheep(this.world, this.save.sheepName, this.save.customization.sheepAccessory, this.save.customization.sheepAccessoryColor);
    this.scene.add(this.player.root, this.sheep.root);
    this.placeFromSave();

    await progress(0.85, 'Pousse de l’herbe…');
    this.terrain.update(this.player.pos.x, this.player.pos.z, Infinity);
    this.landmarks.update(this.player.pos.x, this.player.pos.z, Infinity);

    this.input.attach(this.canvas);
    this.bindEvents();
    window.addEventListener('resize', this.resize);
    await progress(1, 'Prêt !');
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.setScreen('title');
  }

  private makeProgression() {
    const p = new Progression(this.save, (id) => this.landmarkZone.get(id) ?? 'sud');
    p.migrateLegacy();
    p.checkZones(true); // (si la liste des lieux a changé depuis la sauvegarde)
    this.syncZones(p);
    return p;
  }

  /** Recopie les zones ouvertes vers le mur invisible et les barrières. */
  private syncZones(p = this.progression) {
    this.zones.unlocked = new Set(this.save.zones);
    this.zones.openAll = p.unlockAll;
    this.gates?.refresh((id) => this.zones.isOpen(id));
  }

  private placeFromSave() {
    const s = this.save;
    this.hour = s.timeOfDay;
    let { x, z, rotY } = s.player;
    // Nouvelle partie (position NaN/null), ou sauvegarde dans une zone fermée → devant la gare de la 1re zone
    if (x == null || z == null || !Number.isFinite(x) || !Number.isFinite(z) || !this.zones.canEnter(x, z)) {
      const a = this.stations.arrival(this.zones.ordered[0].id);
      ({ x, z } = a);
      rotY = a.heading;
    }
    this.player.teleport(x, z, rotY);
    const spot = findNearest(this.world, x, z, { radius: PLAYER.RADIUS, maxSlope: PLAYER.MAX_SLOPE, medium: 'land', maxWade: 0.2 }, 40);
    if (spot) this.player.teleport(spot.x, spot.z, rotY);
    else if (getVehicle(s.vehicle)?.medium !== 'water' || !this.progression.owns(s.vehicle)) {
      // Sauvegardé en plein vol au-dessus de la mer (ULM) : retour à la gare de la zone
      const zone = this.zones.zoneAt(x, z).id;
      const a = this.stations.arrival(this.zones.isOpen(zone) ? zone : this.zones.ordered[0].id);
      this.player.teleport(a.x, a.z, a.heading);
    }
    this.sheep.placeNear(this.player.pos.x - 2, this.player.pos.z - 2);
    this.rig.snapTo(this.player.pos, rotY);
    // Un véhicule sauvegardé est restauré (sauf s'il n'est plus valide)
    if (s.vehicle !== FOOT_ID) this.selectVehicle(s.vehicle, true);
  }

  private bindEvents() {
    this.offEvents.push(
      events.on('sheepSays', ({ text, duration }) => {
        uiStore.set({ sheepBubble: { text, until: performance.now() + (duration ?? 4200) } });
        this.audio.bleat(0.9 + Math.random() * 0.25);
      }),
      events.on('vehicleBought', ({ vehicleId }) => {
        const v = getVehicle(vehicleId);
        if (!v) return;
        uiStore.toast(`${v.name} acheté ! Il t’attend dans le menu des véhicules.`, v.icon, 5000);
        this.audio.jingle();
        this.persist();
      }),
      events.on('zoneUnlocked', ({ zoneId }) => {
        const z = this.zones.get(zoneId as ZoneId);
        this.syncZones();
        uiStore.toast(`Nouvelle zone ouverte : ${z.name} ! Prends le train à la gare la plus proche.`, '🚂', 8000);
        this.audio.jingle();
        setTimeout(() => this.sheep.say('zoneOpen', true), 2500);
      }),
      events.on('landmarkDiscovered', () => this.audio.jingle()),
    );
  }

  // ======================================================================= BOUCLE
  private loop = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const screenBefore = uiStore.get().screen;
    this.input.update(dt); // ← peut déclencher les callbacks des menus React (onAction)
    if (uiStore.get().device !== this.input.device) uiStore.set({ device: this.input.device });

    const screen = uiStore.get().screen;
    // Si un menu vient de se fermer pendant input.update(), on ignore les appuis de
    // cette frame (sinon "Échap" fermerait la carte ET ouvrirait la pause).
    const actionsAllowed = screen === screenBefore;
    if (screen === 'play') this.updatePlay(dt, actionsAllowed);
    else if (screen === 'photo') this.updatePhoto(dt, actionsAllowed);
    else this.updateMenu(dt, screen);

    // Monde
    const p = this.player.pos;
    this.time += dt;
    this.terrain.update(p.x, p.z);
    this.landmarks.update(p.x, p.z);
    this.landmarks.animate(dt, this.time);
    this.sheep.isNight = this.dayNight.daylight < 0.2;
    this.sheep.update(dt, this.player, this.rig.camera.position);
    this.dayNight.update(this.hour, p, this.rig.camera);
    this.water.update(dt, p.x, p.z, this.dayNight.daylight);
    this.audio.update();

    // Rendu (+ capture photo dans la MÊME frame)
    this.renderer.render(this.scene, this.rig.camera);
    if (this.captureRequested) {
      this.captureRequested = false;
      this.finishCapture();
    }

    this.hudTimer -= dt;
    if (this.hudTimer <= 0 && (screen === 'play' || screen === 'photo')) {
      this.hudTimer = 0.12;
      updateHud({ player: this.player, sheep: this.sheep, camYaw: this.rig.yaw, hour: this.hour, landmarks: this.landmarks, towns: this.towns, progression: this.progression, zones: this.zones, stations: this.stations, nearWaterForBoat: this.nearWaterForBoat() });
    }
    this.saveTimer -= dt;
    if (this.saveTimer <= 0 && screen !== 'title' && screen !== 'loading' && screen !== 'travel') {
      this.saveTimer = SAVE.AUTOSAVE_SECONDS;
      this.persist();
    }
  };

  private updatePlay(dt: number, actionsAllowed: boolean) {
    const input = this.input;
    this.hour = (this.hour + (dt * 24) / TIME.DAY_LENGTH_SECONDS) % 24;

    // Galoper sur le mouton (maintenir "run")
    const dSheep = this.player.pos.distanceTo(this.sheep.pos);
    if (actionsAllowed && input.pressed('run')) this.runArmed = true;
    if (!input.isDown('run')) this.runArmed = false;
    if (this.runArmed && this.player.mode === 'foot' && this.sheep.state === 'follow' && dSheep < 4.5) {
      this.player.mode = 'ride';
      this.sheep.state = 'ridden';
      this.sheep.say('rideStart');
    } else if (!input.isDown('run') && this.player.mode === 'ride') {
      this.player.mode = 'foot';
      this.sheep.state = 'follow';
      this.sheep.placeNear(this.player.pos.x - Math.sin(this.player.heading) * 1.5, this.player.pos.z - Math.cos(this.player.heading) * 1.5);
    }

    this.rig.applyLookDelta(input.lookDelta.x, input.lookDelta.y, false);
    const wasAirborne = this.player.airborne;
    this.player.update(dt, input, this.rig.yaw, true);
    if (this.player.airborne && !wasAirborne) this.sheep.say('takeoff', true);
    if (this.player.zoneBlocked) this.showZoneBanner();
    const v = this.player.vehicle;
    this.rig.updateFollow(dt, input.look, input.zoom, this.player.pos, this.player.heading, this.player.speed > 1, v?.cameraDistance ?? 0, this.player.mode !== 'foot');

    // Pas
    if (this.player.mode === 'foot' && this.player.speed > 1) {
      this.stepTimer -= dt * this.player.speed;
      if (this.stepTimer <= 0) {
        this.stepTimer = 2.2;
        this.audio.footstep();
      }
    }

    if (!actionsAllowed) return;
    const station = this.stations.nearest(this.player.pos.x, this.player.pos.z);
    if (input.pressed('confirm') && station.distance < STATIONS.INTERACT_DISTANCE && !this.player.airborne) {
      this.setScreen('train');
      return;
    }
    if (input.pressed('confirm') && this.player.mode === 'foot' && dSheep < 3) {
      this.sheep.jump();
      this.sheep.say('pet', true);
      input.rumble(0.2, 60);
    }
    if (input.pressed('call')) {
      this.audio.bleat(1.2);
      if (this.sheep.state === 'follow') this.sheep.say('call');
    }
    if (input.pressed('photo')) this.enterPhoto();
    else if (input.pressed('vehicle')) this.setScreen('vehicles');
    else if (input.pressed('map')) this.setScreen('map');
    else if (input.pressed('album')) this.setScreen('album');
    else if (input.pressed('pause')) this.setScreen('pause');
  }

  private updatePhoto(dt: number, actionsAllowed: boolean) {
    const input = this.input;
    this.player.update(dt, input, this.rig.yaw, false);
    this.rig.applyLookDelta(input.lookDelta.x, input.lookDelta.y, true);
    // Œil à hauteur du pilote (cheval, ULM…), pas au niveau du sol du véhicule
    const v = this.player.mode === 'vehicle' ? this.player.vehicle : null;
    this.eye.copy(this.player.pos).y += v ? v.rider.offset[1] : this.player.mode === 'ride' ? 0.78 : 0;
    this.rig.updatePhoto(dt, input, this.eye);
    this.evalTimer -= dt;
    if (this.evalTimer <= 0) {
      this.evalTimer = 0.1;
      const e = this.photo.evaluate(this.rig.camera, this.hour, null);
      uiStore.set({ photo: { ...uiStore.get().photo, fov: this.rig.fov, target: e.landmark ? { name: e.landmark.def.name, quality: e.quality } : null } });
    }
    if (!actionsAllowed) return;
    if (input.pressed('shutter')) this.captureRequested = true;
    else if (input.pressed('photo') || input.pressed('back')) this.exitPhoto();
  }

  private updateMenu(dt: number, screen: Screen) {
    // Écran titre : lente rotation de la caméra autour du joueur
    if (screen === 'title') this.rig.yaw += dt * 0.08;
    this.player.update(dt, this.input, this.rig.yaw, false);
    if (screen === 'customize') {
      // Caméra face au personnage, assez proche pour voir la tenue
      this.rig.yaw = this.player.heading + Math.PI;
      this.rig.updateFollow(dt, { x: 0, y: 0 }, 0, this.player.pos, this.player.heading, false, 0, false, 5.5);
    } else {
      this.rig.updateFollow(dt, { x: 0, y: 0 }, 0, this.player.pos, this.player.heading, false, 0, false);
    }
  }

  // ======================================================================== PHOTO
  private enterPhoto() {
    if (this.player.mode === 'ride') {
      this.player.mode = 'foot';
      this.sheep.state = 'follow';
      this.sheep.placeNear(this.player.pos.x - 1.5, this.player.pos.z - 1.5);
    }
    this.player.photoMode = true;
    this.player.rig.root.visible = false;
    if (this.player.vehicleModel) this.player.vehicleModel.visible = false; // sinon le véhicule bouche l'objectif
    uiStore.set({ photo: { ...uiStore.get().photo, flash: 0, target: null } });
    this.rig.enterPhoto(this.rig.yaw);
    this.setScreen('photo');
    // Le mouton tente parfois de s'incruster dans la photo
    if (this.player.mode === 'foot' && Math.random() < SHEEP.PHOTOBOMB_CHANCE) {
      const f = new THREE.Vector3(Math.sin(this.rig.photoYaw), 0, Math.cos(this.rig.photoYaw));
      const spot = this.player.pos.clone().addScaledVector(f, 5).add(new THREE.Vector3(f.z * 1.6, 0, -f.x * 1.6));
      setTimeout(() => {
        if (uiStore.get().screen === 'photo') this.sheep.startPhotobomb(spot);
      }, 1500 + Math.random() * 2500);
    }
  }

  private exitPhoto() {
    this.player.photoMode = false;
    if (this.player.vehicleModel) this.player.vehicleModel.visible = true;
    this.sheep.stopPhotobomb();
    this.player.rig.root.visible = this.player.mode !== 'vehicle' || this.player.vehicle?.rider.pose !== 'hidden';
    this.rig.exitPhoto();
    this.setScreen('play');
  }

  private async finishCapture() {
    const dataUrl = this.photo.captureCanvas(this.canvas);
    const e = this.photo.evaluate(this.rig.camera, this.hour, this.sheep.pos);
    this.audio.shutter();
    this.input.rumble(0.3, 90);
    const id = `p${Date.now()}`;
    const lm = e.landmark?.def ?? null;
    const title = lm ? lm.name : 'Souvenir d’Irlande';
    let isNew = false;
    let earned = 0;
    if (lm) ({ isNew, earned } = this.progression.recordLandmarkPhoto(lm, e.stars, id));
    this.save.stats.photos++;
    if (e.withSheep) this.save.stats.sheepPhotos++;
    uiStore.set({ photo: { ...uiStore.get().photo, flash: performance.now() }, lastPhoto: { dataUrl, title, stars: e.stars, isNew, withSheep: e.withSheep, earned } });
    events.emit('photoTaken', { photoId: id, landmarkId: lm?.id ?? null, stars: e.stars, withSheep: e.withSheep, isNewLandmark: isNew });
    setTimeout(() => {
      if (isNew) this.sheep.say('discover', true);
      else if (this.sheep.isPhotobombing) this.sheep.say('photobomb', true);
      else this.sheep.say(e.stars >= 3 ? 'photoGreat' : e.stars > 0 ? 'photoMeh' : 'photoNothing', true);
    }, 900);
    await savePhoto({ id, dataUrl, date: Date.now(), hour: this.hour, landmarkId: lm?.id ?? null, stars: e.stars, withSheep: e.withSheep, title });
    this.persist();
  }

  // ===================================================================== UTILITAIRES
  private nearWaterForBoat() {
    if (!this.progression.owns('currach') || this.player.mode !== 'foot') return false;
    const p = this.player.pos;
    for (let a = 0; a < 8; a++) {
      const x = p.x + Math.cos(a * 0.785) * 6;
      const z = p.z + Math.sin(a * 0.785) * 6;
      if (this.hf.waterDepthAt(x, z) > 1) return true;
    }
    return false;
  }

  private applyQuality() {
    const high = this.save.settings.quality === 'high';
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, high ? RENDER.MAX_PIXEL_RATIO : 1));
    this.renderer.shadowMap.enabled = high && RENDER.SHADOWS;
    // Changer castShadow force three.js à recompiler les matériaux (sinon les ombres restent figées)
    if (this.dayNight) this.dayNight.sun.castShadow = high && RENDER.SHADOWS;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    if (this.terrain) this.terrain.radius = high ? TERRAIN.LOAD_RADIUS : TERRAIN.LOAD_RADIUS - 1;
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.rig.resize(w / h);
  };

  persist() {
    const s = this.save;
    s.player = { x: this.player.pos.x, z: this.player.pos.z, rotY: this.player.heading };
    s.vehicle = this.player.mode === 'vehicle' && this.player.vehicle ? this.player.vehicle.id : FOOT_ID;
    s.timeOfDay = this.hour;
    s.stats.distance += this.player.distance - this.distanceSaved;
    this.distanceSaved = this.player.distance;
    writeSave(s);
  }

  // =================================================================== COMMANDES UI
  setScreen(screen: Screen) {
    const prev = uiStore.get().screen;
    if (prev === screen) return;
    // Un bouton tactile ou un joystick tenu au moment du changement d'écran ne doit pas rester "collé"
    this.input.resetVirtual();
    this.runArmed = false;
    uiStore.set({ screen });
    events.emit('screenChanged', { screen });
    if (screen !== 'title' && screen !== 'loading') this.audio.blip(660);
  }

  /** Premier geste utilisateur : débloque le son (obligatoire sur iPad). */
  unlockAudio() {
    this.audio.unlock();
    this.audio.setVolumes(this.save.settings.sfxVolume, this.save.settings.musicVolume);
  }

  continueGame() {
    this.unlockAudio();
    this.setScreen('play');
  }

  newGame() {
    this.unlockAudio();
    deleteSave();
    void clearPhotos();
    this.save = defaultSave();
    this.progression = this.makeProgression();
    // Ordre important : le mouton d'abord (il peut être assis dans le véhicule), puis le joueur
    this.sheep.standUp(this.player.pos.x, this.player.pos.z);
    if (this.player.mode === 'vehicle') this.player.exitVehicle(this.player.pos.x, this.player.pos.z);
    this.player.mode = 'foot';
    this.distanceSaved = this.player.distance;
    this.placeFromSave(); // AVANT toute sauvegarde : sinon persist() écraserait le point de départ
    this.applyCustomization(this.save.customization, this.save.sheepName);
    this.updateSettings(this.save.settings);
    this.setScreen('customize');
  }

  applyCustomization(c: Customization, sheepName: string) {
    this.save.customization = { ...c };
    this.save.sheepName = sheepName.trim() || 'Paddy';
    this.sheep.name = this.save.sheepName;
    this.player.setCustomization(c);
    this.sheep.setAccessory(c.sheepAccessory, c.sheepAccessoryColor);
    if (this.player.mode === 'vehicle' && this.player.vehicleModel && this.player.vehicle?.sheepSeat) {
      const seat = this.player.vehicle.sheepSeat;
      this.sheep.sitIn(this.player.vehicleModel, seat.offset, seat.scale, seat.pose);
    }
    this.persist();
  }

  /**
   * Monte dans un véhicule (ou 'foot' pour descendre).
   * @returns message d'erreur à afficher, ou null si OK.
   */
  selectVehicle(id: string, silent = false): string | null {
    const world = this.world;
    const p = this.player.pos;
    if (this.player.mode === 'ride') {
      this.player.mode = 'foot';
      this.sheep.state = 'follow';
    }
    if (id === FOOT_ID) {
      if (this.player.mode !== 'vehicle') return null;
      const spot = findNearest(world, p.x, p.z, { radius: PLAYER.RADIUS, maxSlope: PLAYER.MAX_SLOPE, medium: 'land', maxWade: 0.2 }, 18);
      if (!spot) return this.player.airborne ? 'Impossible de se poser ici : survole la terre ferme.' : 'Trop loin du rivage pour descendre ! Approche-toi de la terre.';
      this.sheep.standUp(spot.x + 1.2, spot.z + 1.2); // d'abord : il est attaché au modèle du véhicule
      this.player.exitVehicle(spot.x, spot.z);
      return null;
    }
    const v = getVehicle(id);
    if (!v) return 'Véhicule inconnu.';
    if (!this.progression.owns(id)) return `${v.name} n’est pas encore acheté (${v.price} ${ECONOMY.CURRENCY}).`;
    if (this.player.airborne) return 'Pose d’abord le ULM (relâche le stick au-dessus de la terre).';
    // Le ULM se pose au sol pour décoller : on le place comme un véhicule terrestre
    const medium = v.medium === 'air' ? 'land' : v.medium;
    const params = { radius: v.radius, maxSlope: v.maxSlope, medium, maxWade: 0.15 } as const;
    const spot = findNearest(world, p.x, p.z, params, v.medium === 'water' ? 18 : 8);
    if (!spot) return v.medium === 'water' ? 'Il faut être au bord de l’eau pour mettre le bateau à l’eau.' : 'Pas assez de place ici pour ce véhicule.';
    if (this.player.mode === 'vehicle' && this.sheep.state === 'seated') this.sheep.standUp(p.x, p.z);
    this.player.enterVehicle(v, spot.x, spot.z);
    if (v.sheepSeat && this.player.vehicleModel) this.sheep.sitIn(this.player.vehicleModel, v.sheepSeat.offset, v.sheepSeat.scale, v.sheepSeat.pose);
    if (!silent) {
      this.sheep.say(v.medium === 'water' ? 'boat' : v.id === 'horse' ? 'horse' : 'vehicle', true);
      events.emit('vehicleChanged', { vehicleId: id });
    }
    return null;
  }

  /** Achète un véhicule. @returns message d'erreur, ou null si OK. */
  buyVehicle(id: string): string | null {
    const err = this.progression.buy(id);
    if (!err) setTimeout(() => this.sheep.say('unlock', true), 1200);
    return err;
  }

  /** Prend le train jusqu'à la gare de la zone `to` (écran noir, téléportation, arrivée). */
  async takeTrain(to: ZoneId) {
    if (!this.zones.isOpen(to) || this.traveling) return;
    const from = this.stations.nearest(this.player.pos.x, this.player.pos.z).station;
    if (this.player.mode === 'vehicle') {
      const err = this.selectVehicle(FOOT_ID);
      if (err) {
        uiStore.toast(err, '⚠️', 4000);
        this.setScreen('play');
        return;
      }
    }
    this.traveling = true;
    if (this.player.mode === 'ride') {
      this.player.mode = 'foot';
      this.sheep.state = 'follow';
    }
    uiStore.set({ travel: { from: from.name, to: this.stations.get(to).name } });
    this.setScreen('travel');
    this.audio.whistle();
    await wait(STATIONS.TRAVEL_MS * 0.4);
    const a = this.stations.arrival(to);
    const spot = findNearest(this.world, a.x, a.z, { radius: PLAYER.RADIUS, maxSlope: PLAYER.MAX_SLOPE, medium: 'land', maxWade: 0.2 }, 20) ?? a;
    this.player.teleport(spot.x, spot.z, a.heading);
    this.sheep.placeNear(spot.x - 1.5, spot.z - 1.5);
    this.rig.snapTo(this.player.pos, a.heading);
    this.terrain.update(spot.x, spot.z, Infinity);
    this.landmarks.update(spot.x, spot.z, Infinity);
    await wait(STATIONS.TRAVEL_MS * 0.6);
    this.traveling = false;
    uiStore.set({ travel: null });
    this.setScreen('play');
    this.persist();
    setTimeout(() => this.sheep.say('train', true), 1200);
  }

  /**
   * "Je suis coincé" (menu pause) : retour à la gare de la zone où l'on se trouve
   * (ou de la première zone si l'on est hors des zones ouvertes). Le véhicule est rangé.
   */
  async returnToStation() {
    if (this.traveling) return;
    const here = this.zones.zoneAt(this.player.pos.x, this.player.pos.z).id;
    const zone = this.zones.isOpen(here) ? here : this.zones.ordered[0].id;
    if (this.player.mode === 'vehicle') {
      // Ranger le véhicule sans chercher de rivage : on part de toute façon
      if (this.sheep.state === 'seated') this.sheep.standUp(this.player.pos.x, this.player.pos.z);
      this.player.exitVehicle(this.player.pos.x, this.player.pos.z);
    }
    await this.takeTrain(zone);
  }

  /** Panneau "Zone verrouillée" (au plus un à la fois). */
  private showZoneBanner() {
    const now = performance.now();
    const cur = uiStore.get().zoneBanner;
    if (cur && cur.until > now) return;
    const h = this.player.heading;
    const p = this.player.pos;
    const zone = this.zones.zoneAt(p.x + Math.sin(h) * 3, p.z + Math.cos(h) * 3);
    if (this.zones.isOpen(zone.id)) return; // (bord de carte, pas une zone)
    const prev = this.progression.previousZone(zone.id);
    let text = 'Cette zone s’ouvrira plus tard dans l’aventure.';
    if (prev) {
      const st = this.progression.zoneStatus(prev.id);
      text = this.zones.isOpen(prev.id)
        ? `Photographie tous les lieux ☆ principaux de « ${prev.name} » pour l’ouvrir (${st.principalsDone}/${st.principalsTotal}).`
        : `Ouvre d’abord « ${prev.name} ».`;
    }
    uiStore.set({ zoneBanner: { title: zone.name, text, until: now + ZONE_UI.BANNER_SECONDS * 1000 } });
    this.sheep.say('zoneLocked');
    this.input.rumble(0.15, 80);
  }

  updateSettings(partial: Partial<SaveData['settings']>) {
    this.save.settings = { ...this.save.settings, ...partial };
    this.audio.setVolumes(this.save.settings.sfxVolume, this.save.settings.musicVolume);
    this.rig.invertY = this.save.settings.invertY;
    this.applyQuality();
    this.resize();
    this.persist();
  }

  // ======================================================== OUTILS DE DÉBOGAGE (console)
  // Dans la console du navigateur :  __eirelens.debugGoto('rock_of_cashel')
  /** Téléporte le joueur à `distance` u du monument, face à lui. */
  debugGoto(landmarkId: string, distance = 40) {
    const p = this.landmarks.get(landmarkId);
    if (!p) return console.warn('Monument inconnu :', landmarkId, '— ids :', this.landmarks.placed.map((q) => q.def.id).join(', '));
    if (this.player.mode === 'vehicle') {
      const err = this.selectVehicle(FOOT_ID);
      if (err) return `Impossible : ${err}`;
    }
    const world = this.world;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const spot = findNearest(world, p.x + Math.sin(a) * distance, p.z + Math.cos(a) * distance, { radius: PLAYER.RADIUS, maxSlope: PLAYER.MAX_SLOPE, medium: 'land', maxWade: 0.2 }, 6);
      if (!spot) continue;
      const heading = Math.atan2(p.x - spot.x, p.z - spot.z);
      this.player.teleport(spot.x, spot.z, heading);
      this.rig.snapTo(this.player.pos, heading);
      this.sheep.placeNear(spot.x - 1.5, spot.z - 1.5);
      this.terrain.update(spot.x, spot.z, Infinity);
      this.landmarks.update(spot.x, spot.z, Infinity);
      return `OK : ${p.def.name}`;
    }
    return 'Aucun point accessible à cette distance (essaie une autre distance, ou le bateau).';
  }

  /** Ouvre toutes les zones et offre tous les véhicules pour CETTE session (rien n'est sauvegardé). */
  debugUnlockAll() {
    this.progression.unlockAll = true;
    this.syncZones();
    return 'Zones et véhicules débloqués jusqu’au rechargement de la page.';
  }

  /** Ajoute des pièces (sauvegardé). */
  debugMoney(amount = 1000) {
    this.save.money += amount;
    return `${this.save.money} ${ECONOMY.CURRENCY}`;
  }

  /** Zone et gare la plus proche du joueur (vérifier un tracé de frontière). */
  debugWhere() {
    const p = this.player.pos;
    return { zone: this.zones.zoneAt(p.x, p.z).id, gare: this.stations.nearest(p.x, p.z).station.name, x: Math.round(p.x), z: Math.round(p.z) };
  }

  /** Change l'heure (0-24). */
  debugHour(h: number) {
    this.hour = ((h % 24) + 24) % 24;
  }

  async resetEverything() {
    deleteSave();
    await clearPhotos();
    window.location.reload();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.offEvents.forEach((off) => off());
    this.input.detach();
    this.audio.dispose();
    this.terrain?.disposeAll();
    this.renderer?.dispose();
  }
}
