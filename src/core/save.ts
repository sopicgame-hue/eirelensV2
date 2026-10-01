/**
 * Sauvegarde de la progression (localStorage).
 * Les PHOTOS elles-mêmes (images) sont dans IndexedDB : voir photoStore.ts.
 *
 * Si tu ajoutes un champ à SaveData :
 *   1. ajoute-le dans l'interface ET dans defaultSave()
 *   2. NE change PAS SAVE.KEY : loadSave() complète automatiquement les champs
 *      manquants des anciennes sauvegardes avec les valeurs par défaut.
 */
import { SAVE, TIME, ECONOMY } from '../config/gameConfig';
import { Customization, DEFAULT_CUSTOMIZATION } from '../content/customization';
import { ZONES, ZoneId } from '../world/data/zones';

export interface LandmarkRecord {
  stars: number;
  photoId: string;
  date: number;
}

export interface SaveData {
  version: 1;
  createdAt: number;
  player: { x: number; z: number; rotY: number };
  vehicle: string;
  timeOfDay: number;
  customization: Customization;
  sheepName: string;
  /** Meilleure photo par monument. */
  landmarks: Record<string, LandmarkRecord>;
  /** Pièces (gagnées en photographiant, dépensées en véhicules). */
  money: number;
  /** Véhicules achetés (ids). */
  ownedVehicles: string[];
  /** Zones ouvertes (ids). Une zone ouverte le reste pour toujours. */
  zones: ZoneId[];
  stats: { photos: number; sheepPhotos: number; distance: number };
  settings: {
    quality: 'high' | 'low';
    invertY: boolean;
    sfxVolume: number;
    musicVolume: number;
  };
}

/** Première zone (le Sud) : le joueur démarre devant sa gare (Killarney). */
const FIRST_ZONE = [...ZONES].sort((a, b) => a.order - b.order)[0];

export function defaultSave(): SaveData {
  return {
    version: 1,
    createdAt: Date.now(),
    // NaN = "pas encore placé" : Game le pose devant la gare de la première zone
    player: { x: NaN, z: NaN, rotY: 0 },
    vehicle: 'foot',
    timeOfDay: TIME.START_HOUR,
    customization: { ...DEFAULT_CUSTOMIZATION },
    sheepName: 'Paddy',
    landmarks: {},
    money: ECONOMY.START_MONEY,
    ownedVehicles: [],
    zones: [FIRST_ZONE.id],
    stats: { photos: 0, sheepPhotos: 0, distance: 0 },
    settings: { quality: 'high', invertY: false, sfxVolume: 0.8, musicVolume: 0.5 },
  };
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(SAVE.KEY);
  } catch {
    return false;
  }
}

export function loadSave(): SaveData {
  const def = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE.KEY);
    if (!raw) return def;
    const data = JSON.parse(raw);
    return {
      ...def,
      ...data,
      player: { ...def.player, ...data.player },
      customization: { ...def.customization, ...data.customization },
      stats: { ...def.stats, ...data.stats },
      settings: { ...def.settings, ...data.settings },
      landmarks: { ...data.landmarks },
      // Sauvegarde d'avant l'économie : NaN = "à recalculer" (Progression.migrateLegacy)
      money: typeof data.money === 'number' ? data.money : NaN,
      ownedVehicles: Array.isArray(data.ownedVehicles) ? data.ownedVehicles : def.ownedVehicles,
      zones: Array.isArray(data.zones) && data.zones.length ? data.zones : def.zones,
    };
  } catch (e) {
    console.warn('[save] sauvegarde illisible, nouvelle partie', e);
    return def;
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE.KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[save] impossible d’écrire la sauvegarde', e);
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(SAVE.KEY);
  } catch {
    /* ignore */
  }
}
