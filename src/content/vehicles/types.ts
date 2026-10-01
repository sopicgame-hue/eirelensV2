/**
 * Format d'un VÉHICULE. Un véhicule = un fichier dans content/vehicles/ + une
 * ligne dans index.ts. Voir docs/HOWTO_AJOUTER_UN_VEHICULE.md et
 * docs/GUIDE_MODELISATION.md (modèle 3D).
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
  /** Prix d'achat (en pièces, voir ECONOMY dans gameConfig.ts). 0 = offert dès le départ. */
  price: number;
  /**
   * 'land'  : roule / marche sur la terre ;
   * 'water' : navigue (ne peut pas toucher terre) ;
   * 'air'   : roule au sol, décolle dès `flight.takeoffSpeed`, vole au-dessus du relief.
   */
  medium: 'land' | 'water' | 'air';
  maxSpeed: number;
  acceleration: number;
  /** Vitesse de rotation max (rad/s). */
  turnRate: number;
  /** Pente max franchissable au sol — 1 = 45°. */
  maxSlope: number;
  /** Rayon de collision. */
  radius: number;
  /**
   * Position/pose du joueur (coordonnées locales du modèle).
   * 'sit' : assis jambes devant ; 'ride' : à califourchon (cheval) ;
   * 'bike' : pédale ; 'hidden' : invisible (cabine fermée).
   */
  rider: { offset: [number, number, number]; pose: 'sit' | 'bike' | 'ride' | 'hidden' };
  /**
   * Place du mouton (null = le mouton court à côté).
   * pose 'sit' : assis ; 'hang' : suspendu dans un harnais, pattes dans le vide (ULM).
   */
  sheepSeat: { offset: [number, number, number]; scale?: number; pose?: 'sit' | 'hang' } | null;
  /** Réglages de vol (obligatoire si medium = 'air'). */
  flight?: {
    /** Hauteur de croisière au-dessus du relief (unités). */
    cruiseHeight: number;
    /** Vitesse à partir de laquelle on décolle (u/s). */
    takeoffSpeed: number;
    /** Vitesse de montée / descente (u/s). */
    climbRate: number;
  };
  /** Distance de caméra conseillée. */
  cameraDistance: number;
  /** Construit le modèle 3D (avant vers +Z, origine au sol). */
  build(): THREE.Object3D;
  /** Animation optionnelle (roues, pattes, hélice…). speed en u/s. */
  animate?(model: THREE.Object3D, speed: number, dt: number, time: number): void;
}
