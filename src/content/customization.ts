/**
 * PERSONNALISATION DU PERSONNAGE ET DU MOUTON (données éditables)
 * Pour ajouter une option : ajoute une entrée dans la liste concernée.
 * Le modèle 3D (models/characterModel.ts) lit ces identifiants.
 */

export interface Customization {
  body: 'a' | 'b';
  skin: number;
  hairStyle: HairStyleId;
  hairColor: number;
  top: number;
  bottom: number;
  shoes: number;
  hat: HatId;
  hatColor: number;
  sheepAccessory: SheepAccessoryId;
  sheepAccessoryColor: number;
}

export const BODY_OPTIONS: { id: Customization['body']; label: string }[] = [
  { id: 'a', label: 'Silhouette A' },
  { id: 'b', label: 'Silhouette B' },
];

export const HAIR_STYLES = [
  { id: 'short', label: 'Court' },
  { id: 'long', label: 'Long' },
  { id: 'bun', label: 'Chignon' },
  { id: 'curly', label: 'Bouclé' },
  { id: 'bald', label: 'Rasé' },
] as const;
export type HairStyleId = (typeof HAIR_STYLES)[number]['id'];

export const HATS = [
  { id: 'none', label: 'Aucun' },
  { id: 'flatcap', label: 'Casquette irlandaise' },
  { id: 'beanie', label: 'Bonnet' },
  { id: 'bucket', label: 'Bob' },
] as const;
export type HatId = (typeof HATS)[number]['id'];

export const SHEEP_ACCESSORIES = [
  { id: 'none', label: 'Rien' },
  { id: 'scarf', label: 'Écharpe' },
  { id: 'bowtie', label: 'Nœud papillon' },
  { id: 'flatcap', label: 'Casquette' },
] as const;
export type SheepAccessoryId = (typeof SHEEP_ACCESSORIES)[number]['id'];

export const SKIN_TONES = [0xf6d7c3, 0xeec1a0, 0xd8a07a, 0xb57a52, 0x8d5a3b, 0x5e3a26];
export const HAIR_COLORS = [0x1f1a17, 0x5a3825, 0x9a5b2c, 0xd9893b, 0xe9cf8a, 0xb43c2b, 0xd7d7d7];
export const CLOTH_COLORS = [0x2f8f5b, 0x1f6fb2, 0xc0392b, 0xf2c94c, 0xf5f1e6, 0x34495e, 0x8e44ad, 0xe67e22, 0x7f8c8d, 0x2b2b2b];

export const DEFAULT_CUSTOMIZATION: Customization = {
  body: 'a',
  skin: SKIN_TONES[1],
  hairStyle: 'short',
  hairColor: HAIR_COLORS[3],
  top: CLOTH_COLORS[0],
  bottom: CLOTH_COLORS[5],
  shoes: CLOTH_COLORS[9],
  hat: 'flatcap',
  hatColor: CLOTH_COLORS[8],
  sheepAccessory: 'scarf',
  sheepAccessoryColor: CLOTH_COLORS[2],
};
