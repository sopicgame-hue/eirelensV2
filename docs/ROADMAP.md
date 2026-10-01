# EireLens — Feuille de route et prompts prêts à l'emploi

> **Mode d'emploi pour l'humain.**
> 1. Une tâche à la fois, dans l'ordre. Ne lance pas la suivante tant que la précédente
>    n'est pas testée et validée.
> 2. Dans AI Studio, colle d'abord le **prompt d'amorçage** (AGENTS.md §7), puis le prompt de la tâche.
> 3. Après chaque tâche : teste toi-même (checklist en bas de chaque tâche), puis **pousse sur
>    GitHub** (Settings → GitHub → Push) avec un message clair. C'est ton point de retour arrière.
> 4. Si Gemini casse quelque chose : ne lui demande PAS de "tout réparer". Reviens à la version
>    GitHub précédente et redonne la tâche en la découpant plus finement.
> 5. Coche les cases au fur et à mesure.

---

## Phase 0 — Mise en route

### [ ] T0.1 — Prise de connaissance (aucune modification)

```
Lis AGENTS.md, docs/GDD.md et docs/ARCHITECTURE.md. Ne modifie AUCUN fichier.
Réponds en 10 lignes maximum : (1) ce que fait le jeu, (2) où l'on ajoute un monument,
(3) les fichiers que tu n'as pas le droit de modifier sans demande explicite,
(4) comment tu testes un changement. Puis vérifie que le projet compile.
```
✅ Test : la réponse est correcte, aucun fichier n'a changé.

---

## Phase 1 — Contenu : modéliser les 25 monuments provisoires

Chaque monument provisoire (cairn) a déjà son fichier, ses coordonnées, sa description et
son anecdote. Il faut seulement écrire son modèle 3D. **Un monument par prompt.**

### Prompt générique (remplace `<ID>` et colle la FICHE correspondante)

```
TÂCHE : modéliser le monument "<ID>" (fichier src/content/landmarks/<ID>.ts, actuellement
status 'placeholder'). Suis exactement docs/HOWTO_AJOUTER_UN_MONUMENT.md.
Inspire-toi de cliffs_of_moher.ts, rock_of_cashel.ts et glendalough.ts, et utilise en priorité
les briques de src/models/landmarkKit.ts.
Ne modifie QUE ce fichier (et landmarkKit.ts uniquement si une brique réutilisable manque).
Garde id, lat, lon, name, description et funFact inchangés (sauf ajustement côtier documenté).
Passe status à 'done', ajoute rotationDeg, terrain, colliders, photo adaptés, et build().
FICHE VISUELLE :
<colle ici la fiche>
```

✅ Test commun : `__eirelens.debugGoto('<ID>')` puis `__eirelens.debugGoto('<ID>', 120)` ;
posé au sol, reconnaissable, murs non traversables, nom visible dans le viseur photo.

### Fiches visuelles

**[ ] dunluce_castle** — Ruines d'un château au bord d'une falaise de basalte (mer au nord :
rotationDeg ≈ −170). Murs sans toit, pignons percés de fenêtres, deux tours rondes trapues
(cylindres r≈2, sans toit, crénelées) aux angles côté mer, restes d'un manoir (murs à pignons).
Côté terre : une passerelle (pont de pierre étroit, 2 arches) qui franchit une faille.
Terrain : `flatten` r≈12 sur le promontoire. Habille la falaise avec `cliffFace`. Pierre `stone`/`stoneDark`.

**[ ] kylemore_abbey** — Château néogothique en granit gris clair (`stoneLight`) au bord d'un lac,
façade longue (≈30 u) tournée vers le sud (rotationDeg 0), 3 tours crénelées de hauteurs
différentes, nombreuses fenêtres en ogive (boîtes `window` étroites), toit plat crénelé.
Une petite église néogothique à 40 u à l'est. Terrain `flatten` r≈22.

**[ ] croagh_patrick** — Montagne conique (le relief existe déjà). Au sommet : petite chapelle
blanche (`whitewash`, toit `slate`) et cairn. Sentier de pèlerins : 40 pierres claires le long
d'une ligne qui descend vers le nord en suivant `ctx.groundAt`. Statue de saint Patrick (silhouette
simple en `stoneLight`) au pied, à ~200 u au nord. photo : radius 45, maxDistance 650.

**[ ] benbulbin** — Montagne-table : ajoute un tampon `mesa` (radius ≈ 45, height ≈ 34, blend 25)
pour obtenir le sommet plat et les flancs raides. Sur le flanc nord, des "cannelures" verticales :
25 boîtes fines `rockDark`/`rock` alignées suivant le bord du plateau. photo : radius 45, maxDistance 650.

**[ ] slieve_league** — Falaises gigantesques (la zone de falaise existe). Plateforme panoramique de
Bunglass : barrière en bois, panneau, petit parking en gravier. Ancienne tour de guet carrée
(`stone`, 6 u) sur la crête. `cliffFace` avec des couleurs ocre/rouille (`peat`, `rock`, `0x9a6b4a`).
photo : focus vers la mer, radius 25, maxDistance 500.

**[ ] carrick_a_rede** — Pont de corde entre la falaise (origine) et un îlot à ~25 u vers la mer
(+Z, rotationDeg ≈ 150) : tampon `island` (radius 8, height 6) à dz 25. Pont = 20 planches
(`wood`) entre deux cordes (boîtes très fines `woodDark`), avec une légère courbe vers le bas.
Petite cabane de pêcheur blanche sur l'îlot.

**[ ] blarney_castle** — Donjon rectangulaire haut et étroit (`towerHouse` width 6, depth 5,
height 22) avec mâchicoulis : une rangée de petites consoles en saillie sous les créneaux.
Une tour d'escalier plus étroite accolée. Bois autour (le clearRadius peut rester petit : 14).

**[ ] kilkenny_castle** — Grand château en U ouvert vers le parc (rotationDeg à choisir), 3 ailes
(boîtes 30 × 12 × 8) en pierre grise, 3 tours rondes crénelées (cylindres r≈3, h≈15) aux angles,
nombreuses fenêtres rectangulaires. Pelouse devant (`flatten` r≈30). ⚠ Il est en ville : vérifie
qu'aucune maison ne le traverse (augmente clearRadius si besoin).

**[ ] bunratty_castle** — Grande tour-maison avec 4 tours d'angle reliées en haut par des arcs
(`towerHouse` avec `cornerTurrets: true`, height 18) + 3 chaumières (`cottage`) du village
folklorique à 20-30 u.

**[ ] dun_aonghasa** — Fort semi-circulaire au bord d'une falaise de l'île d'Inis Mór (mer à l'ouest).
3 murs de pierres sèches concentriques en arc de cercle (rayons 8, 14, 22), ouverts côté mer,
via `drystoneWall` par segments. Champ de pierres levées (chevaux de frise : 60 petites pierres
pointues) entre le 2e et le 3e mur. `cliffFace` côté mer. requires: 'boat'.

**[ ] ross_castle** — Tour-maison (height 16) au bord du lac, avec une enceinte carrée (mur bas)
et 2 petites tours rondes aux angles. Un ponton en bois et une barque sur le lac.

**[ ] gap_of_dunloe** — Col naturel. Petit pont de pierre en dos d'âne ("Wishing Bridge", `arch`)
sur un ruisseau, chemin de terre, et la chaumière de Kate Kearney (`cottage`) à l'entrée du col.
Ajoute deux tampons `island` (radius 30, height +15 par rapport au sol naturel) de part et
d'autre (dx ±35) pour resserrer le col.

**[ ] clonmacnoise** — Site monastique au bord du Shannon : 2 tours rondes (`roundTower`,
dont une tronquée sans chapeau), cathédrale en ruine (`ruinedChurch` 14 × 7), 3 petites églises,
3 hautes croix (`celticCross` height 4), mur d'enceinte bas, pierres tombales.

**[ ] hook_head** — Phare médiéval très large : `lighthouse` (radius 3.6, height 11, color `whitewash`,
bandColor `black`, bands 2), maisons des gardiens blanches basses autour. Mer de 3 côtés (+Z).

**[ ] mizen_head** — Station de signalisation : 3 bâtiments blancs à toit plat sur un promontoire,
reliés à la terre par un pont en arc (`arch` 12 × 6) au-dessus d'un ravin (tampon `flatten` bas
au milieu, height 1). Escaliers et garde-corps.

**[ ] malin_head** — Tour de guet carrée en pierre (2 étages, 7 u) sur une butte + le message
"EIRE" écrit au sol en grandes lettres de pierres blanches (boîtes `quartz`, lettres de 4 u
de haut, lisibles depuis la caméra). Muret de pierres sèches.

**[ ] errigal** — Montagne conique de quartzite (le relief existe). Au sommet : cairn + 2 petits
sommets jumeaux (rochers `limestone` clairs), éboulis de pierres claires sur les flancs (InstancedMesh
de 200 rochers `limestone`). photo : radius 40, maxDistance 650, bestHours [19, 21].

**[ ] temple_bar** — Rue pavée (`stoneDark`) bordée de 10 façades de pubs de 2-3 étages
alignées des deux côtés, couleurs vives variées ; le pub "The Temple Bar" ROUGE (`facadeA`) au
coin, avec enseigne (boîte `gold`) et horloge. Lanternes. Terrain `flatten` r≈25.
⚠ En ville : clearRadius ≈ 30.

**[ ] titanic_belfast** — Bâtiment de 4 "proues" anguleuses argentées (≈ 20 u de haut) disposées
en croix autour d'un atrium vitré : chaque proue = un prisme pointu incliné vers l'extérieur
(couleur `chrome`), avec des bandes `glass`. Devant : les cales de lancement (2 longues dalles
`stoneDark` vers l'eau). Terrain `flatten` r≈30.

**[ ] dunguaire_castle** — Tour-maison (height 15) sur un rocher au bord de la baie (mer côté
+Z), entourée d'un mur d'enceinte polygonal bas (`drystoneWall`), petite porte.

**[ ] hill_of_tara** — Colline herbeuse : 2 enceintes circulaires accolées (anneaux de levées
de terre : TorusGeometry aplatie couleur `grass`, rayons 10 et 8), la pierre Lia Fáil au centre
(pilier `stoneLight` arrondi de 1,6 u), une petite église en pierre et une statue de saint Patrick
à 25 u. Terrain `flatten` r≈30.

**[ ] ashford_castle** — Grand château victorien gris au bord du lac (mer/lac côté +Z) : corps
principal + 4 à 6 tours crénelées de hauteurs variées, un pont de pierre à arches (3 × `arch`)
à l'entrée. Terrain `flatten` r≈26.

**[ ] mussenden_temple** — Petite rotonde (cylindre r 2,6, h 5, `stoneLight`) entourée de 12
colonnes fines, coiffée d'un dôme (sphère aplatie) et d'une urne. Au bord d'une falaise
(mer au nord, +Z) : `cliffFace`. Ruines d'une maison de maître (pignons) à 30 u au sud.

**[ ] carrauntoohil** — Plus haut sommet (relief existant). Grande croix métallique sombre
(`black`, 4 u) sur un cairn, quelques névés de pierres claires. photo : radius 45, maxDistance 650.

**[ ] fanad_head** — Phare blanc trapu (`lighthouse` radius 1.8, height 9) accolé à deux
maisons de gardiens blanches à toit `slate` (utilise `cottage` en adaptant les couleurs ou des
boîtes), mur d'enceinte blanc, sur un cap rocheux (mer de 3 côtés).

---

## Phase 2 — Gameplay (une fonctionnalité par prompt)

### [ ] T2.1 — Voyage rapide depuis la carte

```
TÂCHE : dans l'écran Carte (src/ui/screens/MapScreen.tsx), quand le monument sélectionné a
déjà été photographié, afficher "A / Espace : s'y rendre". À la validation, appeler une
nouvelle méthode publique Game.fastTravel(landmarkId) qui réutilise la logique de
debugGoto (src/core/Game.ts) à 35 u du monument, fait descendre du véhicule si besoin
(ou garde le currach si le monument a requires 'boat' et qu'aucun point terrestre n'est
trouvé), puis repasse à l'écran 'play'. Un fondu au noir de 0,4 s (div React) masque la
téléportation. Ne modifie que MapScreen.tsx et Game.ts.
```
✅ Test : photographier un monument, s'éloigner, carte → s'y rendre. Monument non
photographié : pas d'option. Pas d'erreur console.

### [ ] T2.2 — Météo : averses et arc-en-ciel

```
TÂCHE : créer src/world/Weather.ts (classe Weather) : alterne beau temps / averse
(durées dans gameConfig, nouvelle section WEATHER). Pluie = InstancedMesh de 1 500 traits
fins qui suivent la caméra (pas de nouvelle géométrie par frame). Pendant l'averse : ciel
et brouillard plus gris et plus proches (modifier DayNight via une méthode setOvercast(0..1),
pas en dupliquant sa logique). Après une averse en journée : un arc-en-ciel (demi-tore
fin multicolore, MeshBasicMaterial transparent) visible 90 s à l'opposé du soleil.
Ajouter un événement 'weatherChanged' dans core/events.ts ; le mouton dit une réplique
(nouvelle clé 'rain' dans sheepLines.ts). Bonus photo +0,1 si l'arc-en-ciel est dans le cadre
(PhotoSystem). Brancher Weather dans Game.ts (création + update). Aucune autre modification.
```
✅ Test : `__eirelens.weather` existe ; forcer une averse depuis la console ; fps stable.

### [ ] T2.3 — Faune : troupeaux de moutons et oiseaux

```
TÂCHE : créer src/world/Wildlife.ts, abonné aux chunks comme Scatter.ts (onChunkCreated /
onChunkDisposed). Dans les champs (pente < 0.4, hors routes/villes/monuments), 0 à 2
troupeaux de 4-8 moutons par chunk : modèle simplifié (réutilise buildSheep sans
accessoire), petites animations de broutage, s'écartent si le joueur passe à < 3 u.
Des mouettes (2 triangles blancs) tournent au-dessus des côtes. Quand le joueur passe
près d'un troupeau, notre mouton dit une réplique (nouvelle clé 'flock'). Budget : < 40
moutons visibles, aucune allocation dans update(). Collisions : aucune.
```

### [ ] T2.4 — Défis photo

```
TÂCHE : créer src/content/challenges.ts (données) et src/systems/Challenges.ts. Un défi =
{ id, titre, description, condition(photoEval, contexte) → boolean, récompense }.
Exemples : "Un phare la nuit", "3 étoiles au coucher du soleil", "Paddy devant un château",
"5 monuments du Munster". Écoute l'événement 'photoTaken' (enrichir son payload si besoin).
Récompenses = nouveaux accessoires du mouton (ajouter dans customization.ts un champ
'unlockedBy'). Ajouter un onglet "Défis" dans AlbumScreen. Sauvegarde dans SaveData
(nouveau champ challenges, avec valeur par défaut). Toast + jingle à la réussite.
```

### [ ] T2.5 — Véhicule : jaunting car (data uniquement)

```
TÂCHE : ajouter le véhicule "Jaunting car" (carriole à cheval de Killarney) en suivant
docs/HOWTO_AJOUTER_UN_VEHICULE.md. unlockAt 10. Le cheval trotte (animate : pattes et
tête). Paddy assis sur la banquette. Ne modifie que src/content/vehicles/.
```

### [ ] T2.6 — Véhicule aérien : montgolfière (tâche moteur)

```
TÂCHE : ajouter medium 'air' aux véhicules. Dans Player.ts : en 'air', l'altitude cible =
max(sol + 25, altitude courante) ajustable avec les gâchettes (input.zoom) entre sol+8 et
sol+90 — en 'air', Game.updatePlay doit alors passer zoom = 0 à rig.updateFollow pour que
les gâchettes ne zooment plus la caméra ; pas de collision avec Colliders ; pas de limite de pente ; ne peut descendre
(selectVehicle 'foot') que si le sol sous le ballon est praticable. Caméra : distance 24.
Puis créer src/content/vehicles/balloon.ts (unlockAt 15, nacelle en osier, ballon rayé
vert/blanc/orange, Paddy dans la nacelle). Modifier uniquement Player.ts, movement.ts si
indispensable, vehicles/types.ts, vehicles/index.ts, vehicles/balloon.ts.
```

### [ ] T2.7 — Mode photo enrichi

```
TÂCHE : dans le mode photo, ajouter (1) 3 filtres (Aucun, Noir & blanc, Sépia) qui défilent
avec une nouvelle action 'filter' à déclarer dans bindings.ts (manette : croix ← ou →,
boutons 14/15 ; clavier : KeyG), appliqués
à la capture via ctx.filter dans PhotoSystem.captureCanvas et en aperçu via un filtre CSS
sur le canvas ; (2) une action "Pose !" (manette X, clavier KeyP en mode photo) qui demande
au mouton de venir se placer à 4 u devant l'objectif (réutiliser Sheep.startPhotobomb).
Mettre à jour les libellés (ui/buttonLabels.ts) et le GDD §5. Ne pas casser la notation.
```

### [ ] T2.8 — Panneaux indicateurs bilingues

```
TÂCHE : aux croisements de routes (échantillons de routes de deux routes différentes à
< 6 u), poser des poteaux indicateurs irlandais (flèches blanches, nom en anglais + nom
irlandais en italique vert : ajouter un champ optionnel nameGa aux villes de towns.ts pour
les 20 plus grandes). Texte via CanvasTexture partagée par panneau (max 60 panneaux
chargés). Nouveau fichier src/world/Signposts.ts, chargé par chunk comme Scatter.
```

### [ ] T2.9 — Pubs de village et musique trad

```
TÂCHE : dans chaque ville de taille ≥ 1, transformer une maison en pub (façade sombre,
enseigne dorée avec le nom "<Ville> Inn"). Quand le joueur est à < 25 u d'un pub, la
musique générative (systems/Audio.ts) passe en mode "trad" : tempo plus rapide, gamme
dorienne, un second instrument (bourdon). Ne modifie que Towns.ts et Audio.ts.
```

### [ ] T2.10 — Télécharger / partager une photo

```
TÂCHE : dans l'album (onglet Pellicule), bouton "Télécharger" (et action A sur la photo
sélectionnée) qui enregistre le JPEG en pleine taille : PhotoSystem doit désormais stocker
aussi une version 1280 px (champ dataUrlFull dans PhotoRecord, rétro-compatible). Sur iPad,
utiliser navigator.share({ files }) si disponible, sinon un lien de téléchargement.
```

---

## Phase 3 — Qualité, performances, finitions

### [ ] T3.1 — Compteur de performances (debug)

```
TÂCHE : si l'URL contient ?debug=1, afficher en haut à gauche : FPS moyen, draw calls,
triangles (renderer.info), nombre de chunks, monuments chargés. Nouveau composant
src/ui/DebugOverlay.tsx, lecture 2×/s. Aucun coût si debug absent.
```
✅ Test sur iPad : noter les FPS à Doolin, à Dublin et en voiture sur l'autoroute.

### [ ] T3.2 — Végétation lointaine allégée

```
TÂCHE : dans Scatter.ts, ne pas faire projeter d'ombre aux InstancedMesh des chunks
situés à plus de 1 chunk du joueur, et masquer buissons/rochers des chunks à plus de 2
chunks. Mettre à jour à chaque changement de chunk (pas à chaque frame).
```

### [ ] T3.3 — Écran de chargement avec astuces

```
TÂCHE : afficher sous la barre de chargement une astuce tirée au hasard dans une nouvelle
liste src/content/tips.ts (15 astuces : heure dorée, galop, photobomb, bateau…).
```

### [ ] T3.4 — Accessibilité

```
TÂCHE : dans le menu pause, réglage "Taille du texte" (normal / grand) qui applique une
classe sur la racine de l'UI ; sensibilité caméra (3 niveaux) stockée dans settings et lue
par CameraRig via gameConfig (multiplicateur). Pas d'autre changement.
```

---

## Idées pour plus tard (non prioritaires)

Saisons (couleurs du terrain), ferry régulier vers les îles d'Aran, villages plus détaillés
(églises, pubs), Giant's Causeway avec Finn McCool caché, mode "carte postale" (texte manuscrit
sur la photo), succès, sauvegarde cloud (nécessite un backend : hors périmètre AI Studio gratuit).
