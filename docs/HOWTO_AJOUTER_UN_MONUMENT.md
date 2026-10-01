# Ajouter, retirer ou modéliser un lieu (monument)

Trois cas :
- **A. Remplacer un cairn provisoire** par un vrai modèle (fichier existant, `status: 'placeholder'`).
- **B. Ajouter un tout nouveau lieu.**
- **C. Retirer un lieu** de la liste.

Fichiers concernés : **uniquement** `src/content/landmarks/<id>.ts` (+ `index.ts` dans les cas B et C).
Ne touche à rien d'autre. Une nouvelle brique réutilisable va dans `src/models/landmarkKit.ts`
(bâtiments) ou `src/models/sceneryKit.ts` (paysages, eau, bateaux, animaux).
Pour le modèle 3D lui-même : **`docs/GUIDE_MODELISATION.md`** (recettes détaillées).

---

## Étape 0 — Importance et zone

- `tier` : `'principal'` (☆, OBLIGATOIRE pour ouvrir la zone suivante), `'secondaire'` (◉)
  ou `'bonus'` (♥). Il fixe aussi la récompense en pièces (voir `ECONOMY` dans `gameConfig.ts`).
- La **zone** (Sud, Irlande du Nord, Ouest, Dublin) est déduite automatiquement des coordonnées
  (`src/world/data/zones.ts`). Vérifie-la dans l'album (onglet de la zone) ou avec
  `__eirelens.debugGoto('<id>')` puis `__eirelens.debugWhere()`.
- ⚠ Ajouter un lieu **principal** dans une zone déjà terminée par un joueur ne la referme pas :
  une zone ouverte le reste (sauvegarde).

## Étape 1 — Coordonnées

Google Maps → clic droit sur le lieu → copier `latitude, longitude` (ex : `51.9291, -8.5709`).
Écris `lat: 51.9291, lon: -8.5709`. Si tu n'es pas sûr, ajoute le commentaire
`// Coordonnées approximatives (à vérifier sur Google Maps)`.

⚠ **Lieux côtiers / au bord d'un lac ou d'une rivière** : le trait de côte du jeu est simplifié
(précision ~300 m). Si le monument apparaît dans l'eau ou trop loin du bord, décale `lat`/`lon` de
0,001 à 0,01 et ajoute le commentaire
`// Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.`

⚠ **Deux lieux très proches** (moins de 1 km dans la réalité = 13 u dans le jeu) : leurs modèles
se chevaucheraient. Décale l'un des deux et signale-le en commentaire (voir `wormhole_aran.ts`).

## Étape 2 — Repère local et orientation

- L'origine (0, 0, 0) du modèle = le sol au point GPS.
- `rotationDeg` tourne tout le modèle. Choisis-le pour que **+Z local** pointe vers ce qui compte :
  l'eau pour un monument côtier, la façade principale pour un bâtiment, la montagne pour un belvédère.
  Formule : direction voulue (dx est, dz sud) → `rotationDeg = atan2(dx, dz) en degrés`.
  Repères : 0 = sud, 90 = est, 180 = nord, −90 = ouest.

## Étape 3 — Terrain

`terrain: [...]` modifie le relief autour du monument :

| kind | Effet | Exemple |
|---|---|---|
| `flatten` | Sol plat (hauteur naturelle au centre, ou `height`, ou `offset`) | Château, lac décoratif |
| `mesa` | Plateau à bords raides à la hauteur `height` | Rocher de Cashel |
| `island` | Garantit une colline/île en dôme jusqu'à `height` | Fastnet, Skellig |

- `dx`/`dz` décalent le tampon en coordonnées locales.
- `height` = hauteur **absolue** (u) ; `offset` = hauteur **relative** au sol naturel du monument
  (ex : `offset: -1.2` → lac 1,2 u plus bas que le belvédère, voir `connemara.ts`).
- ⚠ **Près de l'eau, garde `radius + blend` plus petit que la distance à l'eau**, sinon le tampon
  comble la mer / la rivière (voir les commentaires de `titanic_belfast.ts`, `ross_castle.ts`).
- ⚠ **En ville : les routes ne sont pas effacées par un monument.** Toutes les routes d'une ville
  convergent vers son centre (`towns.ts`) : un monument posé au centre serait traversé par la
  chaussée. Décale-le de 20 à 50 u hors des routes et note les vraies coordonnées en commentaire
  (voir `belfast_city_hall.ts`, `st_fin_barres.ts`, `reginalds_tower.ts`).

## Étape 4 — Modèle 3D (`build(ctx)`)

Outils disponibles (détails et recettes : `docs/GUIDE_MODELISATION.md`) :

- `ModelBuilder` : `box`, `cylinder`, `cone`, `sphere`, `hexColumn`, `roof`, `arch`,
  `crenellations`, `add(géométrie)`, `push/pop`. Les formes sont **posées sur leur base**
  (`y` = bas de la forme ; sauf `sphere` : `y` = centre).
- `landmarkKit.ts` : `towerHouse`, `roundTower`, `lighthouse`, `celticCross`, `ruinedChurch`,
  `cottage`, `drystoneWall`, `cliffFace`.
- `sceneryKit.ts` : `waterfall` (cascade animée), `lake`, `viewpoint` (belvédère), `cairn`,
  `rowingBoat`, `hookerBoat`, `swan`, `dolphin` (animé), `smallTree`, `beam` (câble/poutre
  entre deux points).
- `ctx.groundAt(x, z)` : hauteur du sol en local ; `ctx.waterY` : niveau de l'eau en local ;
  `ctx.rng()` : aléatoire **déterministe** (jamais `Math.random()`).
- Couleurs : noms de `palette.ts`. Matériaux partagés seulement (`sharedMaterials()` : `world`,
  `glow`, `water`, `foam`, `bronze`).

Règles de style :
- **Lisible de loin** : silhouette d'abord, détails ensuite.
- **Échelle** : personnage = 1,6 u. Porte ≈ 1 × 2 u. Étage ≈ 3,3 u. Château-tour ≈ 12–16 u.
- 300 à 6 000 triangles. > 50 éléments identiques : `InstancedMesh` (voir `giants_causeway.ts`).

## Étape 5 — Animation (optionnel)

`animate: (obj, dt, time) => { … }` est appelé à chaque frame tant que le modèle est chargé.
Pour les cascades et le dauphin : `animate: animateScenery` (voir `torc_waterfall.ts`,
`fungie_dingle.ts`). Aucune allocation (`new …`) dans `animate`.

## Étape 6 — Photo

`photo.focus` = centre du sujet `[x, hauteur au-dessus du sol, z]`. `radius` ≈ demi-hauteur visible.
`minDistance`/`maxDistance` : distances où la photo est valide. Un paysage (lac + montagne) peut
avoir un `focus` loin de l'origine (voir `lough_conn.ts`). `bestHours` : bonus d'heure.

## Étape 7 — Collisions et zone dégagée

- `colliders` en coordonnées locales : `{ kind: 'circle', x, z, r }` ou `{ kind: 'box', x, z, hw, hd, rot }`.
  Mets aussi un collider sur l'eau décorative (lac, bassin) pour qu'on ne marche pas dessus.
- `clearRadius` : pas d'arbres ni de maisons dans ce rayon. `clearAreas` : zones dégagées en plus
  (ex : un lac décoratif loin du centre).

## Étape 8 — Enregistrement

- Cas B : dans `src/content/landmarks/index.ts`, ajoute l'`import` et l'entrée dans `LANDMARKS`
  (dans le bloc de sa zone, avec le commentaire d'origine).
- Cas A : passe juste `status` à `'done'`.
- Cas C (retirer) : enlève l'import et l'entrée dans `index.ts`, puis supprime le fichier.
  Les anciennes photos de ce lieu restent dans la pellicule ; rien d'autre à faire.

## Étape 9 — Test (obligatoire)

1. `npm run lint` sans erreur.
2. **Atelier 3D** : `?atelier=landmark:<id>` (ou bouton "Atelier 3D" de l'écran titre) : échelle,
   obstacles (rouge), sujet photo (jaune). Coche "Mer devant" pour un lieu côtier.
3. En jeu → Nouvelle partie → console : `__eirelens.debugUnlockAll()` puis
   `__eirelens.debugGoto('<id>')` et `__eirelens.debugGoto('<id>', 120)` (vue lointaine).
4. Vérifie : posé au sol, pas dans l'eau, orientation correcte, pas de maisons dessus, on ne traverse
   pas les murs, l'eau voisine n'a pas été comblée.
5. Mode photo (C / Y) : le nom apparaît dans le viseur. Prends la photo : la carte affiche "+N 🪙".

## Checklist de rendu

- [ ] `tier` correct, `status: 'done'`, description + anecdote **vraies**
- [ ] Pas de `Math.random()`, pas de nouveau matériau
- [ ] Fichier < 300 lignes
- [ ] Testé dans l'atelier, de près, de loin, et en photo
