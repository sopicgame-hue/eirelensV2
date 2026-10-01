/**
 * Format d'un MONUMENT (lieu à photographier).
 * Un monument = un fichier dans content/landmarks/ + une ligne dans index.ts.
 * Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md pour la procédure complète.
 */
import type * as THREE from 'three';
import type { ColliderShape } from '../../world/Colliders';

export type Province = 'Ulster' | 'Connacht' | 'Leinster' | 'Munster';
export type LandmarkCategory = 'nature' | 'monument' | 'patrimoine' | 'ville' | 'phare';

/** Tampon de terrain en coordonnées LOCALES (dx, dz relatifs au monument, en unités). */
export interface LocalStamp {
  kind: 'flatten' | 'island' | 'mesa';
  dx?: number;
  dz?: number;
  radius: number;
  /** Hauteur ABSOLUE en unités monde (optionnel pour flatten). */
  height?: number;
  blend?: number;
}

export interface BuildContext {
  /** Hauteur du sol en coordonnées LOCALES, relative à l'origine du monument (y=0). */
  groundAt(dx: number, dz: number): number;
  /** Niveau de la mer en coordonnées locales (négatif si le monument est au-dessus de l'eau). */
  waterY: number;
  /** Générateur aléatoire déterministe propre à ce monument (même résultat à chaque partie). */
  rng: () => number;
}

export interface LandmarkDef {
  /** Identifiant unique en snake_case. Ne JAMAIS le changer après publication (sauvegardes). */
  id: string;
  /** Nom affiché (français). */
  name: string;
  county: string;
  province: Province;
  category: LandmarkCategory;
  /** Coordonnées GPS réelles (Google Maps : clic droit → copier "lat, lon"). */
  lat: number;
  lon: number;
  /** Rotation du modèle autour de Y, en degrés. */
  rotationDeg?: number;
  /** 1 à 2 phrases affichées dans l'album. */
  description: string;
  /** Anecdote affichée après la première photo. */
  funFact: string;
  /** 'done' = modélisé ; 'placeholder' = cairn provisoire à remplacer. */
  status: 'done' | 'placeholder';
  /** Moyen de transport nécessaire pour l'atteindre (indice affiché au joueur). */
  requires?: 'boat';
  photo: {
    /** Centre du sujet en local [dx, dy, dz] ; dy est relatif au SOL en (dx, dz). */
    focus: [number, number, number];
    /** "Rayon" visuel du sujet (unités) : sert à juger s'il est assez gros dans le cadre. */
    radius: number;
    minDistance: number;
    maxDistance: number;
    /** Heures (0-24) où la photo vaut un bonus (ex : coucher de soleil). */
    bestHours?: [number, number];
  };
  /** Rayon (u) autour du monument sans arbres ni maisons générés. */
  clearRadius: number;
  /** Modifications du relief (aplanir, îlot, plateau…). */
  terrain?: LocalStamp[];
  /** Obstacles en coordonnées locales (tournés avec le modèle). */
  colliders?: ColliderShape[];
  /** Construit le modèle. L'origine (0,0,0) = le sol au point lat/lon. */
  build?: (ctx: BuildContext) => THREE.Object3D;
}
