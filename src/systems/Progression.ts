/**
 * Progression : monuments découverts, meilleures photos, véhicules débloqués.
 * Toute la logique de "récompense" passe ici (et uniquement ici).
 */
import { SaveData } from '../core/save';
import { VEHICLES } from '../content/vehicles';
import { VehicleDef } from '../content/vehicles/types';
import { events } from '../core/events';

export class Progression {
  /** Outil de test (__eirelens.debugUnlockAll()) : tout est débloqué, jamais sauvegardé. */
  unlockAll = false;

  constructor(private save: SaveData) {}

  get discovered() {
    return Object.keys(this.save.landmarks).length;
  }

  isUnlocked(vehicleId: string) {
    if (vehicleId === 'foot') return true;
    const v = VEHICLES.find((x) => x.id === vehicleId);
    return !!v && (this.unlockAll || this.discovered >= v.unlockAt);
  }

  /** Prochain véhicule à débloquer (pour l'afficher comme objectif). */
  nextUnlock(): VehicleDef | null {
    return VEHICLES.filter((v) => v.unlockAt > this.discovered).sort((a, b) => a.unlockAt - b.unlockAt)[0] ?? null;
  }

  /**
   * Enregistre une photo réussie d'un monument.
   * @returns isNew : premier cliché de ce monument ; improved : meilleure note qu'avant.
   */
  recordLandmarkPhoto(landmarkId: string, stars: number, photoId: string) {
    const before = this.discovered;
    const prev = this.save.landmarks[landmarkId];
    const isNew = !prev;
    const improved = !!prev && stars > prev.stars;
    if (isNew || improved) this.save.landmarks[landmarkId] = { stars, photoId, date: Date.now() };
    if (isNew) {
      events.emit('landmarkDiscovered', { landmarkId });
      for (const v of VEHICLES) if (v.unlockAt > before && v.unlockAt <= this.discovered) events.emit('vehicleUnlocked', { vehicleId: v.id });
    }
    return { isNew, improved };
  }

  stars(landmarkId: string) {
    return this.save.landmarks[landmarkId]?.stars ?? 0;
  }
}
