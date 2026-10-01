/**
 * Format d'un VÉHICULE. Un véhicule = un fichier dans content/vehicles/ + une
 * ligne dans index.ts. Voir docs/HOWTO_AJOUTER_UN_VEHICULE.md.
 *
 * Conduite "arcade" commune à tous les véhicules : le stick indique la
 * direction voulue (relative à la caméra), le véhicule tourne vers elle à
 * `turnRate` et accélère selon l'inclinaison du stick.
 */
import type * as THREE from 'three';

export interface VehicleDef {
  /** Identifiant unique (snake_case). Ne jamais le changer (sauvegardes). */
  id: string;
  name: string;
  description: string;
  /** Icône (emoji) affichée dans les menus. */
  icon: string;
  /** Nombre de monuments photographiés requis pour le débloquer. */
  unlockAt: number;
  /** 'land' : roule sur la terre ; 'water' : navigue (ne peut pas toucher terre). */
  medium: 'land' | 'water';
  maxSpeed: number;
  acceleration: number;
  /** Vitesse de rotation max (rad/s). */
  turnRate: number;
  /** Pente max franchissable (land) — 1 = 45°. */
  maxSlope: number;
  /** Rayon de collision. */
  radius: number;
  /** Position/pose du joueur sur le véhicule (coordonnées locales du modèle). */
  rider: { offset: [number, number, number]; pose: 'sit' | 'bike' | 'hidden' };
  /** Position du mouton à bord (null = le mouton court à côté). */
  sheepSeat: { offset: [number, number, number]; scale?: number } | null;
  /** Distance de caméra conseillée. */
  cameraDistance: number;
  /** Construit le modèle 3D (avant vers +Z, origine au sol). */
  build(): THREE.Object3D;
  /** Animation optionnelle (roues, pédales…). speed en u/s. */
  animate?(model: THREE.Object3D, speed: number, dt: number, time: number): void;
}
