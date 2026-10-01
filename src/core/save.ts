/**
 * Sauvegarde de la progression (localStorage).
 * Les PHOTOS elles-mêmes (images) sont dans IndexedDB : voir photoStore.ts.
 *
 * Si tu ajoutes un champ à SaveData :
 *   1. ajoute-le dans l'interface ET dans defaultSave()
 *   2. NE change PAS SAVE.KEY : loadSave() complète automatiquement les champs
 *      manquants des anciennes sauvegardes avec les valeurs par défaut.
 */
import { SAVE, TIME } from '../config/gameConfig';
import { Customization, DEFAULT_CUSTOMIZATION } from '../content/customization';
import { lonLatToWorld } from '../world/geo';

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
  stats: { photos: number; sheepPhotos: number; distance: number };
  settings: {
    quality: 'high' | 'low';
    invertY: boolean;
    sfxVolume: number;
    musicVolume: number;
  };
}

/** Point de départ : Doolin (Clare), à deux pas des Falaises de Moher. */
const START = lonLatToWorld(-9.372, 53.012);

export function defaultSave(): SaveData {
  return {
    version: 1,
    createdAt: Date.now(),
    player: { x: START.x, z: START.z, rotY: Math.PI },
    vehicle: 'foot',
    timeOfDay: TIME.START_HOUR,
    customization: { ...DEFAULT_CUSTOMIZATION },
    sheepName: 'Paddy',
    landmarks: {},
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
