/**
 * Format d'un MONUMENT (lieu à photographier).
 * Un monument = un fichier dans content/landmarks/ + une ligne dans index.ts.
 * Voir docs/HOWTO_AJOUTER_UN_MONUMENT.md pour la procédure complète.
 */
import type * as THREE from 'three';
import type { ColliderShape } from '../../world/Colliders';

export type Province = 'Ulster' | 'Connacht' | 'Leinster' | 'Munster';
export type LandmarkCategory = 'nature' | 'monument' | 'patrimoine' | 'ville' | 'phare';

/**
 * Importance d'un lieu (notation de la liste de départ) :
 *   principal  ☆ : OBLIGATOIRE — tous les principaux d'une zone ouvrent la zone suivante
 *   secondaire ◉ : rapporte des pièces
 *   bonus      ♥ : lieu caché / difficile d'accès, pour les curieux
 */
export type LandmarkTier = 'principal' | 'secondaire' | 'bonus';

export const TIERS: Record<LandmarkTier, { icon: string; label: string; order: number }> = {
  principal: { icon: '☆', label: 'Principal', order: 0 },
  secondaire: { icon: '◉', label: 'Secondaire', order: 1 },
  bonus: { icon: '♥', label: 'Bonus', order: 2 },
};

/** Tampon de terrain en coordonnées LOCALES (dx, dz relatifs au monument, en unités). */
export interface LocalStamp {
  kind: 'flatten' | 'island' | 'mesa';
  dx?: number;
  dz?: number;
  radius: number;
  /** Hauteur ABSOLUE en unités monde (optionnel pour flatten). */
  height?: number;
  /**
   * Hauteur RELATIVE au sol naturel à l'origine du monument (ex : -1 = lac 1 u plus
   * bas que le monument). Ignorée si `height` est donné. Sans les deux : sol naturel
   * au centre du tampon.
   */
  offset?: number;
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
  /** Importance : voir LandmarkTier ci-dessus. La ZONE est déduite des coordonnées (world/data/zones.ts). */
  tier: LandmarkTier;
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
  /** Zones dégagées supplémentaires, en local (ex : un lac décoratif loin du centre). */
  clearAreas?: { dx: number; dz: number; radius: number }[];
  /** Modifications du relief (aplanir, îlot, plateau…). */
  terrain?: LocalStamp[];
  /** Obstacles en coordonnées locales (tournés avec le modèle). */
  colliders?: ColliderShape[];
  /** Construit le modèle. L'origine (0,0,0) = le sol au point lat/lon. */
  build?: (ctx: BuildContext) => THREE.Object3D;
  /**
   * Animation optionnelle (dauphin qui saute, cascade, drapeau…), appelée à chaque
   * frame tant que le modèle est chargé. `obj` = l'objet renvoyé par build().
   * Règle iPad : aucune allocation (new …) ici ; retrouve tes pièces via obj.userData.
   */
  animate?: (obj: THREE.Object3D, dt: number, time: number) => void;
}
