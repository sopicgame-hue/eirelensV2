/**
 * RELIEF DE L'IRLANDE (données éditables à la main)
 * ---------------------------------------------------------------------------
 * Le contour des côtes vient de `irelandGeo.json` (généré, ne pas éditer).
 * Les montagnes, elles, sont décrites ici sous forme de "massifs" : chaque
 * massif est une bosse elliptique avec une altitude de sommet réelle.
 *
 * Pour AJOUTER une montagne / colline :
 *   1. Récupère lat/lon du sommet sur Google Maps.
 *   2. Ajoute une ligne dans MASSIFS avec son altitude réelle (m).
 *   3. radiusKm = rayon "court" du massif ; stretch = allongement (1 = rond) ;
 *      angleDeg = orientation de l'axe long (0 = est-ouest, 90 = nord-sud).
 *
 * Coordonnées et altitudes : valeurs réelles approximatives (±1 km), suffisantes
 * pour une Irlande miniature. Corrige-les librement si tu as mieux.
 */

export interface Massif {
  name: string;
  lat: number;
  lon: number;
  peakM: number;
  radiusKm: number;
  stretch?: number;
  angleDeg?: number;
  /** 0 = dôme lisse, 1 = très accidenté (crêtes). Défaut 0.5. */
  rugged?: number;
}

export const MASSIFS: Massif[] = [
  // ---------------- ULSTER ----------------
  { name: 'Mourne Mountains', lat: 54.17, lon: -5.98, peakM: 850, radiusKm: 7, stretch: 1.5, angleDeg: 30, rugged: 0.7 },
  { name: 'Slieve Gullion', lat: 54.12, lon: -6.43, peakM: 573, radiusKm: 4 },
  { name: 'Cooley Mountains', lat: 54.03, lon: -6.22, peakM: 589, radiusKm: 5, stretch: 1.6, angleDeg: 20 },
  { name: 'Slieve Croob', lat: 54.34, lon: -5.97, peakM: 534, radiusKm: 4 },
  { name: 'Belfast Hills', lat: 54.62, lon: -6.03, peakM: 478, radiusKm: 4, stretch: 1.8, angleDeg: 70 },
  { name: 'Antrim Plateau', lat: 54.98, lon: -6.18, peakM: 450, radiusKm: 15, stretch: 1.4, angleDeg: 80, rugged: 0.2 },
  { name: 'Trostan', lat: 55.04, lon: -6.15, peakM: 550, radiusKm: 4 },
  { name: 'Sperrin Mountains', lat: 54.8, lon: -7.1, peakM: 678, radiusKm: 7, stretch: 2.5, angleDeg: 0, rugged: 0.4 },
  { name: 'Slieve Snacht (Inishowen)', lat: 55.2, lon: -7.33, peakM: 615, radiusKm: 5 },
  { name: 'Derryveagh Mountains', lat: 55.0, lon: -8.08, peakM: 683, radiusKm: 6, stretch: 2.2, angleDeg: 40, rugged: 0.8 },
  { name: 'Mont Errigal', lat: 55.034, lon: -8.113, peakM: 751, radiusKm: 2.2, rugged: 0.3 },
  { name: 'Blue Stack Mountains', lat: 54.75, lon: -8.1, peakM: 674, radiusKm: 7, rugged: 0.6 },
  { name: 'Slieve League', lat: 54.645, lon: -8.68, peakM: 601, radiusKm: 4, stretch: 1.6, angleDeg: 0, rugged: 0.6 },
  { name: 'Cuilcagh', lat: 54.2, lon: -7.81, peakM: 665, radiusKm: 5, stretch: 1.4, angleDeg: 10, rugged: 0.3 },
  // ---------------- CONNACHT ----------------
  { name: 'Dartry Mountains / Benbulbin', lat: 54.37, lon: -8.42, peakM: 600, radiusKm: 5, stretch: 1.8, angleDeg: 0, rugged: 0.3 },
  { name: 'Slieve Anierin (Arigna)', lat: 54.08, lon: -7.97, peakM: 585, radiusKm: 5 },
  { name: 'Ox Mountains', lat: 54.1, lon: -8.85, peakM: 544, radiusKm: 4, stretch: 3, angleDeg: 35 },
  { name: 'Nephin', lat: 54.01, lon: -9.37, peakM: 806, radiusKm: 4 },
  { name: 'Nephin Beg Range', lat: 54.02, lon: -9.62, peakM: 714, radiusKm: 7, rugged: 0.6 },
  { name: 'Achill — Slievemore', lat: 54.01, lon: -10.06, peakM: 671, radiusKm: 2.5 },
  { name: 'Achill — Croaghaun', lat: 53.98, lon: -10.19, peakM: 688, radiusKm: 2.5 },
  { name: 'Croagh Patrick', lat: 53.76, lon: -9.66, peakM: 764, radiusKm: 3, stretch: 1.8, angleDeg: 0, rugged: 0.5 },
  { name: 'Sheeffry Hills', lat: 53.67, lon: -9.68, peakM: 762, radiusKm: 3.5 },
  { name: 'Mweelrea', lat: 53.637, lon: -9.83, peakM: 814, radiusKm: 4, rugged: 0.7 },
  { name: 'Partry Mountains', lat: 53.6, lon: -9.5, peakM: 600, radiusKm: 5 },
  { name: 'Maumturks', lat: 53.53, lon: -9.65, peakM: 702, radiusKm: 4, stretch: 2, angleDeg: -45, rugged: 0.8 },
  { name: 'Twelve Bens', lat: 53.52, lon: -9.83, peakM: 729, radiusKm: 5, rugged: 0.9 },
  { name: 'The Burren (plateau karstique)', lat: 53.05, lon: -9.15, peakM: 320, radiusKm: 12, stretch: 1.2, rugged: 0.15 },
  { name: 'Slieve Aughty', lat: 53.05, lon: -8.65, peakM: 400, radiusKm: 8, stretch: 1.4, angleDeg: 60, rugged: 0.2 },
  // ---------------- MUNSTER ----------------
  { name: "MacGillycuddy's Reeks (Carrauntoohil)", lat: 52.0, lon: -9.74, peakM: 1038, radiusKm: 5, stretch: 2.2, angleDeg: 0, rugged: 0.9 },
  { name: 'Mangerton / Purple Mountain', lat: 51.96, lon: -9.53, peakM: 839, radiusKm: 4 },
  { name: 'Brandon Mountain', lat: 52.235, lon: -10.25, peakM: 952, radiusKm: 4, stretch: 1.8, angleDeg: 90, rugged: 0.7 },
  { name: 'Slieve Mish', lat: 52.2, lon: -9.8, peakM: 851, radiusKm: 4, stretch: 2, angleDeg: 0, rugged: 0.6 },
  { name: 'Caha Mountains (Beara)', lat: 51.7, lon: -9.72, peakM: 685, radiusKm: 4, stretch: 2.5, angleDeg: 30, rugged: 0.7 },
  { name: 'Shehy Mountains', lat: 51.8, lon: -9.25, peakM: 546, radiusKm: 6 },
  { name: 'Paps / Derrynasaggart', lat: 52.01, lon: -9.27, peakM: 694, radiusKm: 5, stretch: 1.5, angleDeg: 0 },
  { name: 'Mullaghareirk', lat: 52.3, lon: -9.2, peakM: 400, radiusKm: 10, rugged: 0.15 },
  { name: 'Galtee Mountains', lat: 52.37, lon: -8.18, peakM: 919, radiusKm: 4, stretch: 2.5, angleDeg: 0, rugged: 0.6 },
  { name: 'Knockmealdown Mountains', lat: 52.23, lon: -7.92, peakM: 794, radiusKm: 4, stretch: 2.2, angleDeg: 0 },
  { name: 'Comeragh Mountains', lat: 52.23, lon: -7.55, peakM: 792, radiusKm: 6, rugged: 0.5 },
  { name: 'Slievenamon', lat: 52.43, lon: -7.56, peakM: 721, radiusKm: 3.5 },
  { name: 'Silvermines / Keeper Hill', lat: 52.75, lon: -8.26, peakM: 694, radiusKm: 6 },
  { name: 'Ballyhoura Mountains', lat: 52.32, lon: -8.53, peakM: 529, radiusKm: 4 },
  { name: 'Slieve Bernagh (Clare)', lat: 52.82, lon: -8.53, peakM: 532, radiusKm: 4 },
  // ---------------- LEINSTER ----------------
  { name: 'Wicklow Mountains (Lugnaquilla)', lat: 53.05, lon: -6.4, peakM: 925, radiusKm: 9, stretch: 2, angleDeg: 80, rugged: 0.5 },
  { name: 'Dublin Mountains (Kippure)', lat: 53.2, lon: -6.32, peakM: 757, radiusKm: 4 },
  { name: 'Blackstairs (Mount Leinster)', lat: 52.6, lon: -6.79, peakM: 795, radiusKm: 3, stretch: 2.5, angleDeg: 70 },
  { name: 'Slieve Bloom', lat: 53.08, lon: -7.58, peakM: 527, radiusKm: 6, stretch: 1.6, angleDeg: 45, rugged: 0.2 },
];

/**
 * FALAISES CÔTIÈRES : zones où la côte tombe à pic dans la mer au lieu d'une plage.
 * heightM = hauteur réelle approximative des falaises.
 */
export interface CliffZone {
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  heightM: number;
}

export const CLIFF_ZONES: CliffZone[] = [
  { name: 'Cliffs of Moher', lat: 52.97, lon: -9.43, radiusKm: 5, heightM: 214 },
  { name: 'Slieve League', lat: 54.63, lon: -8.68, radiusKm: 4, heightM: 400 },
  { name: 'Causeway Coast', lat: 55.23, lon: -6.45, radiusKm: 9, heightM: 100 },
  { name: 'Fair Head', lat: 55.22, lon: -6.15, radiusKm: 4, heightM: 180 },
  { name: 'Achill — Croaghaun', lat: 53.98, lon: -10.2, radiusKm: 3, heightM: 300 },
  { name: 'Dingle — Slea Head', lat: 52.1, lon: -10.45, radiusKm: 5, heightM: 120 },
  { name: 'Kerry Head / Loop Head', lat: 52.58, lon: -9.9, radiusKm: 6, heightM: 80 },
  { name: 'Old Head of Kinsale', lat: 51.61, lon: -8.53, radiusKm: 3, heightM: 80 },
  { name: 'Mizen Head', lat: 51.45, lon: -9.82, radiusKm: 4, heightM: 120 },
  { name: 'Howth Head', lat: 53.375, lon: -6.07, radiusKm: 3, heightM: 90 },
  { name: 'Horn Head', lat: 55.22, lon: -7.98, radiusKm: 4, heightM: 180 },
  { name: 'Downpatrick Head', lat: 54.32, lon: -9.35, radiusKm: 4, heightM: 80 },
];

/**
 * BIOMES : zones où la couleur du sol change (calcaire du Burren, tourbières…).
 * color = nom de la palette (models/palette.ts).
 */
export interface BiomeZone {
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  color: 'limestone' | 'peat' | 'heather' | 'grassLight';
}

export const BIOMES: BiomeZone[] = [
  { name: 'Burren (pavement calcaire)', lat: 53.06, lon: -9.13, radiusKm: 11, color: 'limestone' },
  { name: 'Tourbières du Connemara', lat: 53.42, lon: -9.65, radiusKm: 14, color: 'peat' },
  { name: 'Tourbière d’Allen', lat: 53.25, lon: -6.95, radiusKm: 10, color: 'peat' },
  { name: 'Landes du Mayo (Ballycroy)', lat: 54.05, lon: -9.75, radiusKm: 12, color: 'heather' },
  { name: 'Wicklow (bruyères)', lat: 53.05, lon: -6.4, radiusKm: 12, color: 'heather' },
  { name: 'Golden Vale (pâturages)', lat: 52.5, lon: -8.2, radiusKm: 20, color: 'grassLight' },
];
