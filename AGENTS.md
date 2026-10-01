# AGENTS.md — RÈGLES POUR L'IA QUI DÉVELOPPE EIRELENS

> **À lire en entier avant TOUTE modification.** Ce fichier s'adresse à l'agent de
> Google AI Studio (Gemini / Antigravity) ou à tout autre assistant de code.
> Il prime sur tes habitudes. En cas de doute : **demande, ne devine pas.**

---

## 1. Le projet en 5 lignes

EireLens est un jeu **contemplatif** en **3D low-poly** (style Pokémon Ultra Soleil) :
on se balade dans une **Irlande miniature géographiquement fidèle**, accompagné d'un
**mouton de compagnie** (ressort comique), pour **photographier des lieux emblématiques**.
Jouable au **clavier, à la manette et au tactile**, dans un navigateur, en plein écran sur **iPad**.
Stack : **Vite + React 19 + TypeScript + three.js + Tailwind v4**. Aucun asset binaire :
**tout est généré en code** (modèles, sons, carte).

Documents de référence :

| Document | Contenu |
|---|---|
| `docs/GDD.md` | Game design : vision, règles, contenus. **Le "quoi" et le "pourquoi".** |
| `docs/ARCHITECTURE.md` | Organisation du code, flux de données. **Le "comment".** |
| `docs/HOWTO_AJOUTER_UN_MONUMENT.md` | Procédure pas à pas pour ajouter / retirer / modéliser un lieu. |
| `docs/HOWTO_AJOUTER_UN_VEHICULE.md` | Procédure pas à pas pour un véhicule (terrestre, bateau, volant). |
| `docs/GUIDE_MODELISATION.md` | **Comment construire un modèle 3D** : échelle, pivots, recettes (bâtiment, cascade, animal…). |
| `docs/ROADMAP.md` | La liste ordonnée des prochaines tâches, avec leurs prompts. |
| `docs/DEPLOIEMENT.md` | GitHub, AI Studio, mise en ligne. |

---

## 2. Les 12 règles d'or (non négociables)

1. **Une tâche = un prompt = un petit changement.** Ne fais QUE ce qui est demandé.
   Pas de "j'en ai profité pour refactoriser". Pas de renommage gratuit.
2. **Ne réécris jamais un fichier entier** pour changer quelques lignes. Modifie le strict nécessaire.
3. **Ne supprime jamais de code que tu ne comprends pas.** Les commentaires en français
   expliquent le pourquoi : lis-les.
4. **Données ≠ code.** Ajouter un monument, un véhicule, une ville, une route, une rivière, une
   montagne, déplacer une frontière de zone, une réplique du mouton = **modifier des données**
   dans `src/content/` ou `src/world/data/`. Ne touche pas au moteur pour ça.
5. **Tous les réglages numériques sont dans `src/config/gameConfig.ts`.** Pas de nombre magique ailleurs.
6. **Toutes les couleurs viennent de `src/models/palette.ts`** (par leur nom : `'stone'`, `'grass'`…).
7. **Tous les modèles 3D sont construits avec `ModelBuilder`** (`src/models/ModelBuilder.ts`)
   et les briques de `src/models/landmarkKit.ts` / `src/models/sceneryKit.ts`
   (voir `docs/GUIDE_MODELISATION.md`), et **vérifiés dans l'Atelier 3D** (`?atelier`). Jamais de `new THREE.Mesh(new THREE.BoxGeometry…)`
   à la main dans le contenu. Jamais de nouveau matériau par objet (voir `materials.ts`).
8. **Le jeu ne lit jamais une touche directement** : il lit des ACTIONS (`src/input/bindings.ts`).
9. **Le moteur ne touche jamais au DOM, l'UI ne touche jamais à three.js.**
   Moteur → `uiStore.set(...)` ; UI → méthodes publiques de `Game` (section "COMMANDES UI").
10. **Aucun déplacement d'entité sans `moveEntity()`** (`src/entities/movement.ts`) : c'est lui
    qui gère pentes, falaises, eau et obstacles. Aucune hauteur de sol sans `hf.heightAt()`.
11. **Fichiers interdits sans demande explicite** :
    - `src/world/data/irelandGeo.json` (généré par `tools/build_geo.py`, ne pas éditer)
    - `src/world/WorldGrid.ts`, `src/world/Heightfield.ts` (cœur du relief et des collisions)
    - `src/input/Input.ts`, `src/core/Game.ts` (seulement si la tâche le demande clairement)
    - `vite.config.ts`, `tsconfig.json`, `package.json` (pas de nouvelle dépendance sans accord)
12. **Pas de `<StrictMode>`** dans `main.tsx` (il créerait deux moteurs 3D). Ne le rajoute pas.

---

## 3. Où mettre quoi (carte rapide)

```
src/
  config/gameConfig.ts      ← TOUS les réglages (vitesses, caméra, distances, qualité…)
  content/                  ← CONTENU DU JEU (données) — c'est ici que tu travailles le plus
    landmarks/              ← 1 fichier par lieu + index.ts (registre, rangé par zone)
    vehicles/               ← 1 fichier par véhicule + index.ts (registre)
    customization.ts        ← options de personnalisation
    sheepLines.ts           ← répliques du mouton
  world/
    data/                   ← géographie : relief.ts (montagnes, falaises, biomes),
                              towns.ts (villes), roads.ts (routes), rivers.ts (rivières ajoutées),
                              zones.ts (4 zones, gares), irelandGeo.json (côtes, NE PAS ÉDITER)
    *.ts                    ← moteur du monde (relief, chunks, eau, ciel, végétation, villes, routes)
  models/                   ← ModelBuilder, palette, matériaux, landmarkKit (bâtiments),
                              sceneryKit (cascades, lacs, bateaux…), gare, personnage, mouton
  entities/                 ← Player, Sheep, CameraRig, movement (déplacements)
  systems/                  ← LandmarkManager, PhotoSystem, Progression (pièces, achats, zones),
                              Zones (mur invisible), Stations (gares), ZoneGates, Audio, Hud
  atelier/                  ← Atelier 3D (outil de création, page ?atelier)
  core/                     ← Game (boucle), events, save, photoStore, math
  input/                    ← bindings (touches ↔ actions), Input
  ui/                       ← React : HUD, écrans (screens/), commandes tactiles
```

---

## 4. Conventions de code

- **Langue** : identifiants en anglais, **commentaires et textes affichés en français**.
- **Unités** : 1 unité ≈ 1 "mètre de jeu". Le personnage mesure ~1,6 u. **Y = haut, Nord = −Z, Est = +X.**
- **Orientation** : `heading = θ` ⇔ l'avant regarde vers `(sin θ, cos θ)` en (x, z) — identique à `object.rotation.y`.
- **Placement géographique** : toujours via `lat`/`lon` réels (Google Maps) et `lonLatToWorld()`.
- **Aléatoire** : toujours `makeRng(seed)` (déterministe) — jamais `Math.random()` pour du contenu du monde
  (autorisé seulement pour des effets éphémères : répliques, sons).
- **Taille des fichiers** : vise < 300 lignes. Au-delà, découpe en fichiers thématiques.
  Seule exception : `core/Game.ts` (chef d'orchestre). Ne le fais PAS grossir : toute nouvelle
  logique va dans un système dédié (`src/systems/…`) que Game se contente de créer et d'appeler.
- **TypeScript strict** : pas de `any` sauf justification en commentaire.
- **Événements** entre systèmes : `events.emit / events.on` (`src/core/events.ts`), pas d'imports croisés.
- **Performance iPad** : pas d'allocation (`new THREE.Vector3()`…) dans les boucles `update()` appelées
  à chaque frame ; > 50 objets identiques ⇒ `InstancedMesh` (exemple : `giants_causeway.ts`).

---

## 5. Comment vérifier ton travail (obligatoire avant de dire "terminé")

1. Le projet compile sans erreur TypeScript (`npm run lint` = `tsc --noEmit`).
2. Le jeu se charge jusqu'à l'écran titre, "Nouvelle partie" fonctionne.
3. La console du navigateur n'affiche **aucune erreur rouge** nouvelle.
4. Tu as testé **précisément** ce que tu as changé. Outils de test dans la console :
   - `__eirelens.debugGoto('rock_of_cashel')` → téléporte près d'un monument
   - `__eirelens.debugGoto('rock_of_cashel', 80)` → idem, à 80 u
   - `__eirelens.debugUnlockAll()` → ouvre toutes les zones et offre tous les véhicules (non sauvegardé)
   - `__eirelens.debugMoney(1000)` → ajoute des pièces
   - `__eirelens.debugWhere()` → zone et gare la plus proche du joueur
   - `__eirelens.debugHour(19.5)` → change l'heure (coucher de soleil)
   - `__eirelens.player.pos` → position du joueur
   - **Atelier 3D** : ajoute `?atelier=landmark:<id>` (ou `vehicle:<id>`) à l'URL pour voir un modèle seul
5. Dans ta réponse, liste : fichiers modifiés, ce qui a été testé, ce qui reste à vérifier par l'humain.

---

## 6. Ce qu'il ne faut JAMAIS faire

- Remplacer le système de relief par des rectangles/des grilles de tuiles codées à la main.
- Ajouter un moteur physique (cannon, rapier, ammo…) : les collisions sont volontairement simples.
- Charger des modèles 3D/textures/sons externes (CDN, fichiers .glb/.png/.mp3) sans demande explicite.
- Utiliser `localStorage` pour des images (→ IndexedDB via `photoStore.ts`).
- Stocker des données de jeu dans des composants React (l'état de partie vit dans `Game.save`).
- Créer un deuxième moteur, une deuxième boucle `requestAnimationFrame`, un deuxième canvas.
- Appeler l'API Gemini depuis le jeu (non prévu, coûteux, inutile).
- Changer l'`id` d'un monument ou d'un véhicule existant (casse les sauvegardes).

---

## 7. PROMPT D'AMORÇAGE (à coller au début de chaque nouvelle session AI Studio)

```
Tu travailles sur le projet EireLens. Avant toute chose, lis intégralement AGENTS.md
à la racine, puis les documents qu'il cite si la tâche les concerne. Respecte
strictement ses 12 règles d'or. Ne modifie que les fichiers nécessaires à la tâche
ci-dessous, ne réécris pas de fichiers entiers, n'ajoute aucune dépendance.
À la fin, liste les fichiers modifiés et la procédure de test.

TÂCHE :
<colle ici le prompt de la tâche, copié depuis docs/ROADMAP.md>
```
