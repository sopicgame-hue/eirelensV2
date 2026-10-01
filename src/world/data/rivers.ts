/**
 * RIVIÈRES AJOUTÉES À LA MAIN (données éditables)
 * ---------------------------------------------------------------------------
 * Le Shannon vient de Natural Earth (irelandGeo.json). Les autres rivières
 * utiles au jeu (un pont à photographier, une ville traversée…) sont tracées
 * ici, point par point, en [lat, lon] (copiés depuis Google Maps).
 *
 * - `widthM` : largeur réelle en mètres. En dessous de ~600 m, la rivière est
 *   élargie automatiquement (sinon elle serait invisible à l'échelle du jeu).
 * - Les routes qui traversent une rivière deviennent des ponts automatiquement.
 * - Après un ajout, vérifie qu'aucune gare ni aucun monument ne tombe dans l'eau.
 */
export interface RiverDef {
  name: string;
  widthM: number;
  line: [number, number][];
}

export const EXTRA_RIVERS: RiverDef[] = [
  {
    // La Foyle traverse Derry/Londonderry (Peace Bridge) puis rejoint le Lough Foyle.
    // Tracé décalé de ~15 u à l'est de la route Derry–Strabane : une route "assèche"
    // l'eau sur ~7 u autour d'elle (WorldGrid), elle effacerait la rivière.
    name: 'Foyle',
    widthM: 250,
    line: [
      [55.075, -7.235],
      [55.05, -7.258],
      [55.03, -7.272],
      [55.012, -7.284],
      [54.998, -7.29],
      [54.985, -7.298],
      [54.965, -7.318],
      [54.94, -7.345],
      [54.905, -7.368],
      [54.87, -7.398],
      [54.835, -7.443],
    ],
  },
  {
    // La Liffey traverse Dublin d'ouest en est jusqu'à la baie.
    name: 'Liffey',
    widthM: 120,
    line: [
      [53.362, -6.46],
      [53.356, -6.4],
      [53.35, -6.34],
      [53.3475, -6.3],
      [53.346, -6.27],
      [53.3465, -6.245],
      [53.3445, -6.21],
      [53.342, -6.185],
    ],
  },
];
