/**
 * PALETTE — toutes les couleurs nommées du jeu.
 * Style visé : low-poly lumineux et saturé façon Pokémon Ultra Soleil.
 * Règle : dans les modèles, utilise TOUJOURS un nom de cette palette
 * (ex : 'stone') plutôt qu'un code hexadécimal en dur. Ajoute ici si besoin.
 */
export const PALETTE = {
  // Terrain
  grass: 0x6fbf4a,
  grassDark: 0x4f9a3a,
  grassLight: 0x9bd35a,
  meadow: 0x86c95a,
  peat: 0x8a6a45,
  heather: 0x8f7385,
  sand: 0xead8a0,
  rock: 0x8d8f8a,
  rockDark: 0x5f625e,
  limestone: 0xc9c6b8,
  road: 0x55585c,
  roadLine: 0xf2f0e6,
  seaFloor: 0x3b7f8c,
  // Pierre & bâti
  stone: 0xa7a59c,
  stoneLight: 0xcfcbbf,
  stoneDark: 0x77756e,
  basalt: 0x3e4044,
  basaltTop: 0x5c5f63,
  whitewash: 0xf5f1e6,
  thatch: 0xc9a25b,
  slate: 0x4c5563,
  wood: 0x8b5a2b,
  woodDark: 0x5e3b1c,
  door: 0xc8332f,
  window: 0x2f4e6f,
  glass: 0xbfe3f2,
  gold: 0xe7c14e,
  lighthouseRed: 0xc63a2f,
  quartz: 0xf7f7f2,
  copperGreen: 0x6fae9a, // cuivre oxydé des dômes
  // Façades irlandaises (maisons colorées)
  facadeA: 0xe94f4f,
  facadeB: 0x4f8fe9,
  facadeC: 0xf2c94c,
  facadeD: 0x6fcf97,
  facadeE: 0xbb6bd9,
  facadeF: 0xf2994a,
  facadeG: 0xf5f1e6,
  // Végétation
  leaf: 0x3f8f3a,
  leafLight: 0x5fae45,
  leafDark: 0x2e6b2f,
  trunk: 0x6b4a2b,
  gorse: 0xf3d23b,
  // Personnages
  wool: 0xf7f4ec,
  woolShade: 0xe2ddd0,
  sheepFace: 0x2b2522,
  black: 0x1d1d1f,
  white: 0xffffff,
  pink: 0xf2a7b8,
  // Véhicules
  bikeGreen: 0x2f8f5b,
  horseCoat: 0xc2b8a6, // poney du Connemara (gris clair)
  horseShade: 0x9c9284,
  horseMane: 0x4a3d33,
  hoof: 0x2e2722,
  leather: 0x7a4a24,
  saddleCloth: 0x2f8f5b,
  ulmPod: 0xf5f1e6,
  ulmWing: 0xe94f4f,
  ulmWingStripe: 0xf2c94c,
  rope: 0xd9c7a0,
  // Eau, bateaux, animaux
  waterDeep: 0x2a7f9e,
  sailRed: 0xa0452b,
  dolphin: 0x6f8796,
  dolphinBelly: 0xc9d3d8,
  moss: 0x5d8a3a,
  // Gares et trains
  trainGreen: 0x1f6f4a,
  trainCream: 0xf1e3c1,
  rail: 0x6b6e72,
  signYellow: 0xf5c518,
  tyre: 0x222222,
  chrome: 0xd8dde3,
  boatHull: 0x2b2f3a,
} as const;

export type PaletteName = keyof typeof PALETTE;

/** Couleurs de façade utilisées pour les villes (tirage déterministe). */
export const FACADES: PaletteName[] = ['facadeA', 'facadeB', 'facadeC', 'facadeD', 'facadeE', 'facadeF', 'facadeG', 'whitewash'];
