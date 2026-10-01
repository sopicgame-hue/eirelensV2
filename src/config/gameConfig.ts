/**
 * ============================================================================
 *  EIRELENS — RÉGLAGES CENTRAUX
 * ============================================================================
 *  TOUTES les valeurs numériques de gameplay et de rendu vivent ici.
 *  Règle : ne JAMAIS écrire un nombre "magique" de gameplay ailleurs dans le
 *  code. Si tu as besoin d'un nouveau réglage, ajoute-le ici avec un commentaire.
 *
 *  Unités : 1 unité monde ≈ 1 "mètre de jeu". Le personnage mesure ~1,6 u.
 *  Axe Y = haut. Nord = -Z. Est = +X.
 * ============================================================================
 */

export const WORLD = {
  /** Échelle horizontale : unités monde par degré de latitude (1° ≈ 111 km réels). */
  UNITS_PER_DEG_LAT: 1500,
  /** Centre de projection (lon/lat) : le point (0,0,0) du monde. */
  ORIGIN_LON: -8.0,
  ORIGIN_LAT: 53.4,
  /** Emprise de la grille (lon/lat). Tout ce qui est hors de cette boîte est de la mer. */
  BOUNDS: { minLon: -11.0, maxLon: -5.3, minLat: 51.25, maxLat: 55.55 },
  /** Espacement des sommets de la grille de relief (unités). */
  GRID_SPACING: 5,
  /** Exagération verticale : unités de hauteur par mètre réel d'altitude. */
  VERTICAL_SCALE: 0.06,
  /** Niveau de l'eau (mer, lacs, rivières partagent le même niveau). */
  WATER_LEVEL: 0,
  /** Seed du bruit procédural. Changer = autre micro-relief, même géographie. */
  SEED: 1916,
};

export const TERRAIN = {
  /** Nombre de cellules par côté d'un chunk de terrain. */
  CHUNK_CELLS: 32,
  /** Rayon de chargement des chunks autour du joueur (en chunks). */
  LOAD_RADIUS: 3,
  /** Nombre max de chunks générés par frame (évite les saccades). */
  CHUNKS_PER_FRAME: 1,
  /** Largeur de la plage (unités) entre l'eau et l'herbe. */
  BEACH_WIDTH: 10,
  /** Altitude réelle (m) moyenne de l'intérieur des terres. */
  INLAND_BASE_M: 60,
  /** Amplitude (m) des collines douces procédurales. */
  HILLS_AMPLITUDE_M: 70,
  /** Distance à la côte (unités) pour atteindre l'altitude intérieure. */
  INLAND_RAMP: 250,
  /** Profondeur max de la mer (unités, valeur positive). */
  SEA_DEPTH: 8,
  /** Largeur (unités) d'une route. */
  ROAD_WIDTH: 4.6,
};

export const PLAYER = {
  WALK_SPEED: 6,
  /** Vitesse quand on chevauche le mouton (bouton "galoper"). */
  SHEEP_RIDE_SPEED: 13,
  ACCELERATION: 30,
  TURN_SPEED: 12, // rad/s, rotation du modèle vers la direction de marche
  RADIUS: 0.45, // rayon de collision
  /** Pente max franchissable à pied (0 = plat, 1 = 45°). */
  MAX_SLOPE: 1.25,
  /** Profondeur d'eau max où l'on peut encore marcher (pieds dans l'eau). */
  MAX_WADE_DEPTH: 0.35,
  EYE_HEIGHT: 1.45,
};

export const SHEEP = {
  NAME: 'Paddy',
  FOLLOW_DISTANCE: 2.2,
  CATCHUP_DISTANCE: 9, // au-delà, il court
  TELEPORT_DISTANCE: 45, // au-delà, il "réapparaît" derrière le joueur
  WALK_SPEED: 5.5,
  RUN_SPEED: 14,
  /** Probabilité (0-1), à chaque ouverture de l'appareil photo, qu'il vienne faire un "photobomb". */
  PHOTOBOMB_CHANCE: 0.25,
  /** Intervalle moyen (s) entre deux répliques spontanées. */
  CHATTER_INTERVAL: 45,
};

export const CAMERA = {
  FOV: 50,
  DISTANCE: 12,
  MIN_DISTANCE: 5,
  MAX_DISTANCE: 22,
  PITCH: 0.42, // radians (≈ 24°) — vue plongeante façon Pokémon
  MIN_PITCH: 0.15,
  MAX_PITCH: 1.1,
  ROTATE_SPEED: 2.4, // rad/s au stick droit
  /** Souris / glisser tactile : radians par pixel déplacé. */
  DRAG_SENSITIVITY: 0.005,
  FOLLOW_LERP: 6,
  /** La caméra vise ce nombre d'unités AU-DESSUS du joueur (montre plus de paysage). */
  LOOK_UP: 2.4,
  NEAR: 0.3,
  FAR: 1400,
};

export const PHOTO = {
  MIN_FOV: 14, // zoom max
  MAX_FOV: 70, // grand angle
  ZOOM_SPEED: 30, // degrés de FOV par seconde
  LOOK_SPEED: 1.8,
  /** Taille relative minimale du sujet dans le cadre (rayon projeté / hauteur écran). */
  MIN_SUBJECT_SIZE: 0.06,
  /** Taille idéale (3 étoiles possibles). */
  IDEAL_SUBJECT_SIZE: 0.22,
  /** Heures "golden hour" (bonus) — format 0-24. */
  GOLDEN_HOURS: [
    [6.5, 8.5],
    [18.5, 20.5],
  ] as [number, number][],
  THUMB_WIDTH: 480,
  JPEG_QUALITY: 0.82,
};

export const TIME = {
  /** Durée d'une journée de jeu complète, en secondes réelles. */
  DAY_LENGTH_SECONDS: 20 * 60,
  START_HOUR: 10,
};

export const RENDER = {
  /** Plafond du devicePixelRatio (2 sur iPad = trop coûteux). */
  MAX_PIXEL_RATIO: 1.5,
  SHADOWS: true,
  SHADOW_MAP_SIZE: 2048,
  SHADOW_RANGE: 45, // demi-taille de la zone d'ombres autour du joueur
  FOG_NEAR: 220,
  FOG_FAR: 520,
};

export const STREAMING = {
  /** Distance d'apparition des monuments (modèle 3D + collisions). */
  LANDMARK_SPAWN_DISTANCE: 650,
  LANDMARK_DESPAWN_DISTANCE: 800,
};

export const ECONOMY = {
  /** Nom et icône de la monnaie du jeu. */
  CURRENCY: 'pièces',
  ICON: '🪙',
  /** Récompense d'une photo 3 étoiles selon l'importance du lieu. */
  TIER_REWARD: { principal: 120, secondaire: 80, bonus: 60 },
  /** Part de la récompense selon le nombre d'étoiles (index = étoiles). Une meilleure photo paie la différence. */
  STAR_FACTOR: [0, 0.5, 0.75, 1],
  /** Pièces au début d'une nouvelle partie. */
  START_MONEY: 0,
};

export const STATIONS = {
  /** Distance (u) à la gare pour pouvoir prendre le train. */
  INTERACT_DISTANCE: 9,
  /** Rayon (u) autour d'une gare sans maisons ni arbres générés. */
  CLEAR_RADIUS: 27, // > demi-longueur des voies (25 u)
  /** Durée (ms) du fondu au noir pendant le voyage en train. */
  TRAVEL_MS: 2600,
};

export const ZONE_UI = {
  /** Durée d'affichage (s) du panneau "Zone verrouillée". */
  BANNER_SECONDS: 4,
};

export const DEV = {
  /** Affiche le bouton "Atelier 3D" sur l'écran titre (outil de création). Mettre false pour une version publique. */
  ATELIER_BUTTON: true,
};

export const SAVE = {
  KEY: 'eirelens.save.v1',
  AUTOSAVE_SECONDS: 10,
};
