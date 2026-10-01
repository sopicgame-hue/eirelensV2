# Ajouter ou modéliser un monument

Deux cas :
- **A. Remplacer un cairn provisoire** par un vrai modèle (fichier existant, `status: 'placeholder'`).
- **B. Ajouter un tout nouveau lieu.**

Fichiers concernés : **uniquement** `src/content/landmarks/<id>.ts` (+ `index.ts` dans le cas B).
Ne touche à rien d'autre. Si tu as besoin d'une nouvelle brique réutilisable, ajoute-la dans
`src/models/landmarkKit.ts` (et seulement là).

---

## Étape 1 — Coordonnées

Google Maps → clic droit sur le lieu → copier `latitude, longitude` (ex : `51.9291, -8.5709`).
Écris `lat: 51.9291, lon: -8.5709`.

⚠ **Lieux côtiers** (phares, falaises, châteaux en bord de mer) : le trait de côte du jeu est
simplifié (précision ~300 m). Si le monument apparaît dans l'eau ou trop loin du bord, décale
`lat`/`lon` de 0,001 à 0,01 et ajoute le commentaire
`// Coordonnées réelles légèrement ajustées pour tomber sur le trait de côte simplifié du jeu.`

## Étape 2 — Repère local et orientation

- L'origine (0, 0, 0) du modèle = le sol au point GPS.
- `rotationDeg` tourne tout le modèle. Choisis-le pour que **+Z local** pointe vers ce qui compte :
  la mer pour un monument côtier, la façade principale pour un bâtiment.
  Formule : direction voulue (dx est, dz sud) → `rotationDeg = atan2(dx, dz) en degrés`.
  Repères : 0 = sud, 90 = est, 180 = nord, −90 = ouest.

## Étape 3 — Terrain

`terrain: [...]` modifie le relief autour du monument :

| kind | Effet | Exemple |
|---|---|---|
| `flatten` | Sol plat (hauteur naturelle au centre, ou `height`) | Château, abbaye |
| `mesa` | Plateau à bords raides à la hauteur `height` | Rocher de Cashel |
| `island` | Garantit une colline/île en dôme jusqu'à `height` | Fastnet, Skellig |

`dx`/`dz` décalent le tampon en coordonnées locales. `height` est une hauteur **absolue** (u).
Hauteurs utiles : niveau de la mer = 0 ; plaine = 3 à 8 ; une falaise de 200 m ≈ 12.

## Étape 4 — Modèle 3D (`build(ctx)`)

Outils disponibles :

- `ModelBuilder` : `box`, `cylinder`, `cone`, `sphere`, `hexColumn`, `roof`, `arch`,
  `crenellations`, `push/pop` (sous-groupe décalé/tourné). Les formes sont **posées sur leur base**
  (`y` = bas de la forme ; sauf `sphere` : `y` = centre).
- `landmarkKit.ts` : `towerHouse` (château-tour irlandais), `roundTower`, `lighthouse`,
  `celticCross`, `ruinedChurch`, `cottage`, `drystoneWall`, `cliffFace` (habillage de falaise).
- `ctx.groundAt(x, z)` : hauteur du sol en local → pour poser un élément sur un terrain en pente.
- `ctx.waterY` : niveau de la mer en local (utile pour les phares, rochers, pontons).
- `ctx.rng()` : aléatoire **déterministe** (jamais `Math.random()` ici).
- Couleurs : noms de `palette.ts` (`'stone'`, `'slate'`, `'whitewash'`, `'thatch'`…) ou `0xRRGGBB`
  pour un cas unique.

Règles de style :
- **Lisible de loin** : silhouette d'abord (tours, toits, pignons), détails ensuite.
- **Échelle** : personnage = 1,6 u. Porte ≈ 1 × 2 u. Étage ≈ 3,3 u. Un château-tour ≈ 12–16 u.
  Exagère un peu ce qui est emblématique (le monde est miniaturisé).
- 300 à 5 000 triangles. Au-delà de ~50 éléments identiques : `InstancedMesh`
  (voir `giants_causeway.ts`).
- Éléments lumineux (lanterne de phare, fenêtres éclairées) : matériau partagé
  `sharedMaterials().glow` → voir `lighthouse(…, root)` dans `landmarkKit.ts`. Jamais de nouveau matériau.
- Si tu réutilises une géométrie PARTAGÉE (ex : `natureGeometries().treeRound` pour planter des arbres
  dans ton monument), mets `mesh.userData.sharedGeometry = true` : sinon elle serait détruite quand
  le monument disparaît, et tous les arbres du jeu avec.

## Étape 5 — Photo

`photo.focus` = centre du sujet `[x, hauteur au-dessus du sol, z]`. `radius` ≈ demi-hauteur visible.
`minDistance`/`maxDistance` : distances où la photo est valide. Les grands sujets naturels
(montagne) : `radius` 40+, `maxDistance` 600+.

## Étape 6 — Collisions

`colliders` en coordonnées locales (tournées avec le modèle) :
`{ kind: 'circle', x, z, r }` ou `{ kind: 'box', x, z, hw, hd, rot }` (demi-largeur/demi-profondeur).
Couvre les murs et tours ; laisse passer les petits éléments (croix, pierres tombales).

## Étape 7 — Enregistrement (cas B seulement)

Dans `src/content/landmarks/index.ts` : ajoute l'`import` et l'entrée dans `LANDMARKS`
(l'ordre = numéro dans l'album). Pour le cas A, passe juste `status` à `'done'`.

## Étape 8 — Test (obligatoire)

1. `npm run lint` sans erreur.
2. Lance le jeu → Nouvelle partie → console :
   `__eirelens.debugGoto('<id>')` puis `__eirelens.debugGoto('<id>', 120)` (vue lointaine).
3. Vérifie : posé au sol (ni flottant, ni enterré), pas dans l'eau, orientation correcte,
   on ne traverse pas les murs, on peut s'approcher.
4. Mode photo (C / Y) : le nom apparaît dans le viseur et la jauge se remplit quand on cadre bien.
5. Aucune erreur dans la console.

## Checklist de rendu

- [ ] `status: 'done'`, description + anecdote **vraies**
- [ ] Pas de `Math.random()`, pas de `new THREE.Material` superflu
- [ ] Fichier < 300 lignes
- [ ] Testé de près, de loin, et en photo
