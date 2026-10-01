/**
 * Progression : photos des lieux, pièces, véhicules achetés, zones ouvertes.
 * Toute la logique de "récompense" passe ici (et uniquement ici).
 *
 * Règles (réglages dans gameConfig.ts → ECONOMY) :
 *   - une photo d'un lieu rapporte TIER_REWARD[tier] × STAR_FACTOR[étoiles] ;
 *     refaire une meilleure photo paie la différence ;
 *   - quand TOUS les lieux "principaux" d'une zone ont au moins 1 étoile,
 *     la zone suivante (ordre de world/data/zones.ts) s'ouvre ;
 *   - les véhicules s'achètent avec les pièces (champ `price`).
 */
import { SaveData } from '../core/save';
import { ECONOMY } from '../config/gameConfig';
import { VEHICLES, FOOT_ID } from '../content/vehicles';
import { LANDMARKS } from '../content/landmarks';
import { LandmarkDef } from '../content/landmarks/types';
import { ZONES, ZoneId } from '../world/data/zones';
import { events } from '../core/events';

export class Progression {
  /** Outil de test (__eirelens.debugUnlockAll()) : tout est ouvert et offert, jamais sauvegardé. */
  unlockAll = false;

  constructor(
    private save: SaveData,
    /** Zone d'un lieu (calculée par Game à partir des coordonnées). */
    readonly zoneOf: (landmarkId: string) => ZoneId,
  ) {}

  /**
   * Sauvegarde créée avant l'économie (money = NaN) : on crédite les pièces des photos déjà
   * prises et on offre les véhicules que l'ancien système débloquait (vélo ≥ 2 lieux, bateau ≥ 7).
   */
  migrateLegacy() {
    if (Number.isFinite(this.save.money)) return;
    let money = 0;
    for (const def of LANDMARKS) if (this.stars(def.id) > 0) money += this.reward(def, this.stars(def.id));
    this.save.money = money;
    if (this.discovered >= 2 && !this.save.ownedVehicles.includes('bicycle')) this.save.ownedVehicles.push('bicycle');
    if (this.discovered >= 7 && !this.save.ownedVehicles.includes('currach')) this.save.ownedVehicles.push('currach');
  }

  // ------------------------------------------------------------------ lieux
  get discovered() {
    return Object.keys(this.save.landmarks).length;
  }

  stars(landmarkId: string) {
    return this.save.landmarks[landmarkId]?.stars ?? 0;
  }

  /** Pièces rapportées par une photo `stars` étoiles de ce lieu. */
  reward(def: LandmarkDef, stars: number) {
    const f = ECONOMY.STAR_FACTOR[Math.max(0, Math.min(3, stars))] ?? 0;
    return Math.round(ECONOMY.TIER_REWARD[def.tier] * f);
  }

  /**
   * Enregistre une photo d'un lieu.
   * @returns isNew : premier cliché ; improved : meilleure note qu'avant ; earned : pièces gagnées.
   */
  recordLandmarkPhoto(def: LandmarkDef, stars: number, photoId: string) {
    const prev = this.save.landmarks[def.id];
    const isNew = !prev && stars > 0;
    const improved = !!prev && stars > prev.stars;
    let earned = 0;
    if (isNew || improved) {
      earned = this.reward(def, stars) - (prev ? this.reward(def, prev.stars) : 0);
      this.save.landmarks[def.id] = { stars, photoId, date: Date.now() };
      this.save.money += earned;
    }
    if (isNew) events.emit('landmarkDiscovered', { landmarkId: def.id });
    if (earned > 0) events.emit('moneyEarned', { amount: earned, total: this.save.money, landmarkId: def.id });
    if (isNew) this.checkZones();
    return { isNew, improved, earned };
  }

  // ------------------------------------------------------------------ pièces
  get money() {
    return this.save.money;
  }

  // ------------------------------------------------------------------ zones
  isZoneOpen(id: ZoneId) {
    return this.unlockAll || this.save.zones.includes(id);
  }

  /** Avancement des lieux principaux d'une zone (ce qui ouvre la suivante). */
  zoneStatus(id: ZoneId) {
    const inZone = LANDMARKS.filter((l) => this.zoneOf(l.id) === id);
    const principals = inZone.filter((l) => l.tier === 'principal');
    return {
      principalsDone: principals.filter((l) => this.stars(l.id) > 0).length,
      principalsTotal: principals.length,
      principalsLeft: principals.filter((l) => this.stars(l.id) === 0),
      discovered: inZone.filter((l) => this.stars(l.id) > 0).length,
      total: inZone.length,
    };
  }

  /** La zone qui ouvre `id` (la précédente dans l'ordre), ou null pour la première. */
  previousZone(id: ZoneId) {
    const sorted = [...ZONES].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((z) => z.id === id);
    return i > 0 ? sorted[i - 1] : null;
  }

  /**
   * Ouvre les zones dont la précédente est terminée (principaux photographiés).
   * @param silent true au chargement : pas d'annonce.
   */
  checkZones(silent = false) {
    const sorted = [...ZONES].sort((a, b) => a.order - b.order);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const zone = sorted[i];
      if (this.save.zones.includes(zone.id) || !this.save.zones.includes(prev.id)) continue;
      const st = this.zoneStatus(prev.id);
      if (st.principalsDone < st.principalsTotal) continue;
      this.save.zones.push(zone.id);
      if (!silent) events.emit('zoneUnlocked', { zoneId: zone.id });
    }
  }

  // ------------------------------------------------------------------ véhicules
  owns(vehicleId: string) {
    return vehicleId === FOOT_ID || this.unlockAll || this.save.ownedVehicles.includes(vehicleId);
  }

  /** Achète un véhicule. @returns message d'erreur, ou null si l'achat a réussi. */
  buy(vehicleId: string): string | null {
    const v = VEHICLES.find((x) => x.id === vehicleId);
    if (!v) return 'Véhicule inconnu.';
    if (this.owns(vehicleId)) return null;
    if (this.save.money < v.price) return `Il te manque ${v.price - this.save.money} ${ECONOMY.CURRENCY} pour ${v.name}.`;
    this.save.money -= v.price;
    this.save.ownedVehicles.push(v.id);
    events.emit('vehicleBought', { vehicleId: v.id });
    return null;
  }

  /** Prochain véhicule à acheter (le moins cher non possédé), pour l'afficher comme objectif. */
  nextPurchase() {
    return VEHICLES.filter((v) => !this.owns(v.id)).sort((a, b) => a.price - b.price)[0] ?? null;
  }
}
