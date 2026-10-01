# Guide de modélisation 3D (monuments, véhicules, animaux)

Ce guide s'adresse à l'IA de Google AI Studio (et à toi). Dans EireLens, **tous les modèles 3D
sont écrits en code** : on empile des formes simples colorées avec `ModelBuilder`, qui les fusionne
en un seul objet rapide à afficher sur iPad. Pas de fichier .glb, pas de texture.

Outil indispensable : **l'Atelier 3D** (bouton "🛠 Atelier 3D" de l'écran titre, ou
`?atelier=landmark:<id>` / `?atelier=vehicle:<id>` dans l'URL). Il affiche le modèle seul sur un
quadrillage (1 case = 1 u), à côté du personnage (1,6 u) et du mouton, avec les obstacles en rouge,
le sujet photo en jaune et la flèche bleue = avant (+Z). Il signale les erreurs et les modèles trop
lourds. **Toujours vérifier un modèle dans l'atelier avant de le tester en jeu.**

---

## 1. Repère, échelle, couleurs

```
        +Y (haut)
         │
         │   +Z = AVANT du modèle (façade, proue, tête du cheval, côté mer)
         │  ╱
         │ ╱
         └──────── +X (droite quand on regarde vers +Z… depuis derrière)
     origine (0,0,0) = le SOL au point GPS (monument) / sous le véhicule
```

| Repère d'échelle | Taille (u) |
|---|---|
| Personnage | 1,6 de haut |
| Mouton | 1,1 de haut, 1,4 de long |
| Porte | 1 × 2 |
| Étage | 3,3 |
| Maison | 6 × 5 × 4 (+ toit) |
| Château-tour irlandais | 7 × 6 × 14 |
| Tour ronde monastique | Ø 2,6 × 15 |
| Arbre | 4 à 6 |

Le monde est **miniaturisé** (1 km réel ≈ 13,5 u) mais les monuments sont à **demi-échelle humaine**
(un bâtiment de 30 m ≈ 15 u). Exagère ce qui est emblématique.

Couleurs : **toujours un nom de `src/models/palette.ts`** (`'stone'`, `'slate'`, `'whitewash'`,
`'thatch'`, `'grass'`, `'leaf'`…). Si une couleur manque, ajoute-la dans la palette avec un nom clair.

---

## 2. ModelBuilder en 10 lignes

```ts
const b = new ModelBuilder();
b.box(4, 3, 4, 'whitewash');                      // largeur X, hauteur Y, profondeur Z — posée sur sa BASE
b.roof(4.4, 1.6, 4.8, 'thatch', { y: 3 });        // toit à 2 pans, faîtage le long de X
b.box(0.9, 1.8, 0.1, 'door', { z: 2.02 });        // porte, collée à la façade +Z (0,02 de décalage)
b.cylinder(0.5, 0.6, 2, 'stone', { x: 3 }, 8);    // rayon haut, rayon bas, hauteur, couleur, place, segments
b.cone(1, 2, 'leaf', { y: 2 }, 6);
b.sphere(1, 'rock', { y: 1, sy: 0.6 }, 0);        // ⚠ sphère : y = CENTRE ; detail 0 = très facetté
b.push({ x: 10, ry: 0.5 }); /* … formes du sous-groupe … */ b.pop();
return b.mesh();                                  // un seul mesh, matériau partagé
```

`Place` = `{ x, y, z, rx, ry, rz, sx, sy, sz }`. Les rotations tournent la forme **autour de sa
base** (boîte, cylindre, cône) ou de son centre (sphère). Ordre des rotations : Y puis X puis Z.

Formes spéciales : `arch` (mur percé d'une arche), `crenellations` (créneaux sur un rectangle),
`hexColumn`, `add(géométrieThree, couleur, place)` pour une forme sur mesure (voir la proue de
`titanic_belfast.ts`, faite avec `THREE.Shape` + `ExtrudeGeometry`).

---

## 3. Recettes de monuments

### 3.1 Bâtiment (maison, gare, château)
1. Volume principal : `box`. 2. Toit : `roof` (ou `cone` pour une tour). 3. Ouvertures : petites
boîtes `'window'` / `'door'` **collées** à la façade (+0,02). 4. Détails qui lisent bien de loin :
cheminées, créneaux, bandeaux de pierre plus claire.
Briques prêtes : `towerHouse`, `cottage`, `ruinedChurch`, `roundTower`, `lighthouse`, `celticCross`
(`src/models/landmarkKit.ts`). Exemples : `ross_castle.ts`, `kilkenny_castle.ts`, `king_johns_castle.ts`.

### 3.2 Ruine
Murs de hauteurs inégales (`ctx.rng()`), pas de toit, un pignon debout, fenêtres = boîtes `'black'`.
Exemple : `miners_village.ts` (fonction `ruin`).

### 3.3 Pont, câbles, mâts penchés
`beam(b, x1, y1, z1, x2, y2, z2, rayon, couleur)` tend un cylindre entre deux points.
Un tablier courbe = une suite de segments (`box` tournées de `ry`). Exemple : `peace_bridge.ts`.

### 3.4 Statue
Construis la forme avec ModelBuilder puis `new THREE.Mesh(b.build(), sharedMaterials().bronze)`.
Exemple : `fungie_dingle.ts`.

### 3.5 Nature : falaises, rochers, cascades, lacs
- Falaise côtière : `cliffFace(b, ctx, { xFrom, xTo })` habille le bord du relief réel.
- Rochers : `sphere(r, 'rock', { sy: 0.6 }, 0)` avec `ctx.rng()` pour varier.
- Cascade : `waterfall(root, b, ctx, { height, width, steps })` + `animate: animateScenery`
  (exemples : `torc_waterfall.ts`, `powerscourt_waterfall.ts`). Ajoute un tampon `flatten`.
- Lac décoratif : `lake(root, b, ctx, { x, z, rx, rz, y })` sur un tampon `flatten`
  (avec `offset` négatif si le lac doit être plus bas), + un collider sur l'eau (`connemara.ts`).
- Belvédère (muret, banc, panneau) : `viewpoint(b, ctx, { radius })` (`lough_conn.ts`).

### 3.6 Monument au bord de l'eau
- Oriente `rotationDeg` pour que l'eau soit en +Z.
- `ctx.waterY` = niveau de l'eau en local : pose bateaux (`rowingBoat`, `hookerBoat`), cygnes,
  jetées dessus.
- **Pas de `flatten` large** : il comblerait l'eau (rayon + blend < distance à l'eau).
- Dans l'atelier, coche "🌊 Mer devant (+Z)".

---

## 4. Recettes de véhicules et d'animaux

### 4.1 Pièces animées = groupes séparés
Tout ce qui bouge (roue, patte, tête, hélice, aile) est **un `THREE.Group` à part**, dont la
position est le **point de pivot**. Construis la géométrie *autour* de ce pivot :

```ts
// Patte : pivot à la hanche (en haut), géométrie construite VERS LE BAS
const leg = new THREE.Group();
leg.position.set(0.26, 1.2, 0.62);                          // la hanche
b.cylinder(0.11, 0.08, 0.55, 'horseCoat', { y: -0.55 });    // de -0,55 à 0
b.cylinder(0.1, 0.11, 0.12, 'hoof', { y: -1.17 });
leg.add(b.mesh());
root.add(leg);
// Roue : pivot au moyeu, cylindre couché (rz = π/2), centré sur le pivot
```

Range les références dans `root.userData.rig = { legs, head, … }` et retrouve-les dans `animate`
(sans `getObjectByName` à chaque frame, sans `new`).

### 4.2 Animation procédurale
```ts
animate(model, speed, dt, time) {
  const rig = model.userData.rig;
  rig.phase += speed * dt * 1.15;            // la cadence suit la vitesse
  const k = Math.min(1, speed / 6);          // amplitude : immobile → galop
  rig.legs[0].rotation.x = Math.sin(rig.phase) * 0.7 * k;
  rig.legs[1].rotation.x = -Math.sin(rig.phase) * 0.7 * k;
}
```
Trot (cheval) : pattes en **diagonale** synchronisées (avant-gauche avec arrière-droite).
Roue : `rotation.x += speed / rayon * dt`. Hélice : `rotation.z += (6 + speed) * dt`.
Exemples complets : `horse.ts`, `bicycle.ts`, `ulm.ts`.

### 4.3 Pilote et mouton
- `rider.offset` = position du **bassin** du personnage moins 0,55 (le bassin est à 0,55 u du sol
  du personnage). Poses : `sit`, `ride` (à califourchon), `bike`, `hidden`.
- `sheepSeat.offset` = centre du corps du mouton ; `scale` 0,5–0,7 ; `pose: 'hang'` = suspendu.
- Vérifie dans l'atelier que personne ne "flotte" ni ne traverse le véhicule.

### 4.4 Un nouvel animal non chevauchable (décor)
Pour un animal de décor (vache, cerf, phoque) dans un monument : mêmes recettes, et une petite
fonction d'animation appelée depuis le `animate` du monument (voir `sceneryKit.ts`, `dolphin`).

---

## 5. Performance (iPad)

- Un monument : **300 à 6 000 triangles** (l'atelier affiche le compte). Sphères : `detail` 0 ou 1.
- Plus de ~50 éléments identiques (colonnes, pierres) : `InstancedMesh` (`giants_causeway.ts`).
- Jamais de nouveau matériau : `sharedMaterials()` → `world`, `glow`, `water`, `foam`, `bronze`.
- Rien d'alloué dans `animate` (pas de `new THREE.Vector3()`), pas de `Math.random()` dans `build`
  (utilise `ctx.rng()` : le monument est identique à chaque partie).

## 6. Pièges fréquents

| Symptôme | Cause | Correction |
|---|---|---|
| Une forme flotte ou s'enfonce | Sur une pente | `y: ctx.groundAt(x, z)` |
| Une sphère est à moitié enterrée | Sphère = y au CENTRE | Ajoute le rayon à `y` |
| Le toit est en travers | `roof` : faîtage le long de X | `ry: Math.PI / 2` ou inverser largeur/profondeur |
| Clignotement entre deux faces | Deux faces au même endroit | Décale de 0,02 |
| La rivière / la mer a disparu | Tampon `flatten` trop large | Réduis `radius + blend` |
| Des maisons poussent dans le monument | `clearRadius` trop petit | Augmente-le, ou `clearAreas` |
| On marche sur le lac décoratif | Pas de collider sur l'eau | Ajoute une `box` sur le lac |
| La patte tourne autour de son milieu | Pivot mal placé | Groupe au pivot + géométrie vers le bas |

## 7. Prompts types pour AI Studio

**Modéliser un lieu existant (cairn provisoire)** :
```
Remplace le modèle provisoire de src/content/landmarks/<id>.ts par un vrai modèle, en suivant
docs/HOWTO_AJOUTER_UN_MONUMENT.md et docs/GUIDE_MODELISATION.md. Éléments reconnaissables à
représenter : <liste : ex. tour carrée crénelée, toit d'ardoise, enceinte en U, lac côté ouest>.
Taille réelle : <ex. tour de 25 m>. Utilise les briques de landmarkKit.ts / sceneryKit.ts.
Passe status à 'done'. Vérifie dans l'atelier (?atelier=landmark:<id>) puis en jeu.
```

**Ajouter un lieu** :
```
Ajoute le lieu "<nom>" (<comté>), coordonnées <lat>, <lon>, importance <principal|secondaire|bonus>.
Description : <1 phrase>. Anecdote vraie : <1 phrase>. Crée src/content/landmarks/<id>.ts en copiant
_template.ts, puis ajoute-le à index.ts dans le bloc de sa zone. Suis docs/HOWTO_AJOUTER_UN_MONUMENT.md.
```

**Ajouter un véhicule** :
```
Ajoute le véhicule "<nom>" (prix <N> pièces, milieu land|water|air), en suivant
docs/HOWTO_AJOUTER_UN_VEHICULE.md et docs/GUIDE_MODELISATION.md (section 4). Inspire-toi de
<horse.ts | bicycle.ts | currach.ts | ulm.ts>. Le mouton voyage <où>. Vérifie dans l'atelier
(?atelier=vehicle:<id>) avec le curseur Vitesse.
```

Astuce : décris toujours à Gemini **3 à 5 éléments visuels distinctifs** du lieu (formes, couleurs,
matériaux). C'est ce qui rend un modèle low-poly reconnaissable, pas le nombre de détails.
