/**
 * ZONES DE JEU (données éditables)
 * ---------------------------------------------------------------------------
 * L'Irlande est découpée en 4 zones débloquées dans l'ordre (`order`).
 * Une zone se débloque quand TOUS les lieux "principaux" (☆) de la zone
 * précédente ont été photographiés. Une zone verrouillée est fermée par un
 * mur invisible ; on rejoint une zone débloquée en prenant le TRAIN à une gare.
 *
 * Polygones : listes de [lat, lon] (dans l'ordre de Google Maps), qui
 * couvrent AUSSI la mer (le bateau et l'ULM respectent les zones).
 * La zone `fallback: true` récupère tout ce qui n'est dans aucun polygone.
 *
 * Pour déplacer une frontière : modifie les points concernés DANS LES DEUX
 * zones voisines (elles partagent leurs points de frontière).
 */

export type ZoneId = 'sud' | 'nord' | 'ouest' | 'dublin';

export interface ZoneDef {
  id: ZoneId;
  name: string;
  /** Ordre de déblocage (1 = disponible dès le début). */
  order: number;
  /** Couleur sur la carte. */
  color: string;
  /**
   * Gare de la zone (point d'arrivée du train). Coordonnées réelles, parfois
   * décalées de quelques centaines de mètres pour laisser la place au modèle.
   * rotationDeg : orientation de la voie ferrée (0 = voie est-ouest, quai au sud).
   */
  station: { name: string; lat: number; lon: number; rotationDeg?: number };
  polygon: [number, number][];
  fallback?: boolean;
}

// Frontière Irlande du Nord, parcourue du nord (Lough Foyle) vers l'est
// (Carlingford Lough), puis prolongée en mer. Partagée par 'nord' et ses voisines.
const NI_BORDER: [number, number][] = [
  [56.2, -6.95],
  [55.19, -6.97],
  [55.1, -7.15],
  [55.04, -7.37],
  [54.95, -7.43],
  [54.83, -7.475],
  [54.72, -7.66],
  [54.6, -7.86],
  [54.5, -8.06],
  [54.45, -8.17],
  [54.36, -8.0],
  [54.3, -7.9], // ← point triple Nord / Ouest / Dublin (Belcoo – Blacklion)
  [54.2, -7.72],
  [54.17, -7.5],
  [54.17, -7.28],
  [54.3, -7.1],
  [54.38, -6.97],
  [54.28, -6.85],
  [54.2, -6.78],
  [54.07, -6.66],
  [54.03, -6.5],
  [54.04, -6.38],
  [54.12, -6.3],
  [54.07, -6.2],
  [54.02, -6.07],
  [54.0, -4.5],
];
const NI_TRIPLE = 11; // index de [54.3, -7.9] dans NI_BORDER

// Frontière Sud / Ouest : de la mer (estuaire du Shannon) jusqu'au Lough Derg.
const SUD_OUEST: [number, number][] = [
  [52.55, -12],
  [52.56, -9.95],
  [52.62, -9.3],
  [52.66, -8.85],
  [52.7, -8.6],
  [52.8, -8.45],
  [53.0, -8.25],
  [53.05, -7.95], // ← point triple Sud / Ouest / Dublin
];

// Frontière Sud / Dublin : Offaly → Carlow (Dublin) / Kilkenny (Sud) → Wicklow / Wexford → mer.
const SUD_DUBLIN: [number, number][] = [
  [53.05, -7.95],
  [52.95, -7.6],
  [52.85, -7.1],
  [52.75, -6.75],
  [52.72, -6.5],
  [52.72, -4.5],
];

// Frontière Ouest / Dublin : à l'est du Shannon (Clonmacnoise, Athlone, Leitrim = Ouest ;
// Cavan = Dublin), jusqu'au point triple avec l'Irlande du Nord.
const OUEST_DUBLIN: [number, number][] = [
  [53.05, -7.95],
  [53.25, -7.8],
  [53.45, -7.75],
  [53.65, -7.85],
  [53.85, -7.75],
  [54.05, -7.62],
  [54.3, -7.9],
];

export const ZONES: ZoneDef[] = [
  {
    id: 'sud',
    name: 'Le Sud',
    order: 1,
    color: '#f2c94c',
    station: { name: 'Gare de Killarney', lat: 52.064, lon: -9.4995 },
    polygon: [[50.8, -12], ...SUD_OUEST, ...SUD_DUBLIN.slice(1), [50.8, -4.5]],
  },
  {
    id: 'nord',
    name: 'L’Irlande du Nord',
    order: 2,
    color: '#56ccf2',
    station: { name: 'Gare de Belfast', lat: 54.5948, lon: -5.9406 },
    polygon: [...NI_BORDER, [56.2, -4.5]],
  },
  {
    id: 'ouest',
    name: 'L’Ouest et le Nord-Ouest',
    order: 3,
    color: '#f2994a',
    station: { name: 'Gare de Galway', lat: 53.2795, lon: -9.0395 },
    polygon: [
      ...SUD_OUEST,
      ...OUEST_DUBLIN.slice(1),
      // frontière nord parcourue à l'envers, de Fermanagh jusqu'au Lough Foyle
      ...NI_BORDER.slice(0, NI_TRIPLE).reverse(),
      [56.2, -12],
    ],
  },
  {
    id: 'dublin',
    name: 'Dublin et ses environs',
    order: 4,
    color: '#6fcf97',
    // Décalée au sud de la Liffey : l'aplanissement de la gare comblerait la rivière
    station: { name: 'Gare de Dublin (Heuston)', lat: 53.333, lon: -6.2943 },
    polygon: [],
    fallback: true,
  },
];
