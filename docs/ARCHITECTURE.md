# EireLens — Architecture technique

> Pour l'IA développeuse et pour l'humain qui la pilote. À lire avant toute modification
> du moteur. Pour ajouter du contenu, les HOWTO suffisent.

## 1. Stack

| Brique | Rôle | Pourquoi |
|---|---|---|
| Vite 8 + React 19 + TS | Projet standard Google AI Studio | Import/sync GitHub sans friction |
| three.js 0.186 | Rendu 3D WebGL | Mature, connu des IA, aucun plugin requis |
| Tailwind v4 | Style de l'UI | Habituel pour Gemini |
| Web Audio API | Sons procéduraux | Zéro fichier audio |
| IndexedDB | Photos (images) | localStorage limité à 5 Mo |
| localStorage | Progression | Simple, synchrone |

**Aucune dépendance de jeu supplémentaire** (pas de moteur physique, pas de loader de modèles).
Les versions (Vite 8, TypeScript 7, plugin React 6) sont alignées sur celles du modèle de projet
généré par Google AI Studio (Node ≥ 20.19 requis en local).

## 2. Vue d'ensemble

```
            ┌──────────────── React (src/ui) ────────────────┐
            │ GameView → écran courant (HUD, menus, viseur)   │
            │   lit uiStore (useUi)    appelle game.xxx()     │
            └───────────▲───────────────────────┬─────────────┘
                        │ uiStore.set()         │ commandes UI
┌───────────────────────┴───────────────────────▼──────────────────────┐
│ Game (src/core/Game.ts) — boucle requestAnimationFrame               │
│  1. input.update()                                                   │
│  2. logique de l'écran : updatePlay / updatePhoto / updateMenu       │
│  3. monde : terrain.update, landmarks.update, sheep, dayNight, water │
│  4. renderer.render()  (+ capture photo dans la même frame)          │
│  5. HUD (8×/s), autosave (10 s)                                      │
└──────┬───────────────┬────────────────┬───────────────┬──────────────┘
       │               │                │               │
   World (src/world)  Entities         Systems         Content (données)
   WorldGrid          Player           LandmarkManager landmarks/*.ts
   Heightfield        Sheep            PhotoSystem     vehicles/*.ts
   TerrainChunks      CameraRig        Progression     customization.ts
   Scatter, Towns,    movement.ts      Zones, Stations sheepLines.ts
   Roads, Water,                       ZoneGates       world/data/zones.ts
   DayNight, Colliders                 Audio, Hud      world/data/rivers.ts
```

Communication transversale : `events` (bus typé, `src/core/events.ts`) — ex. `photoTaken`,
`landmarkDiscovered`, `moneyEarned`, `vehicleBought`, `zoneUnlocked`, `sheepSays`.

L'**Atelier 3D** (`src/atelier/`) est une page à part (`?atelier`) : même code de modèles, mais
sans monde ni boucle de jeu. `App.tsx` choisit entre `GameView` et `AtelierView`.

## 3. Génération du monde (au chargement, ~1-2 s)

1. **WorldGrid** : grille de 1 021 × 1 291 sommets (pas de 5 u) couvrant l'Irlande.
   - Remplit le masque terre/eau à partir de `irelandGeo.json` (côtes + îles), puis les lacs, le Shannon
     et les rivières tracées à la main (`data/rivers.ts` : Foyle, Liffey).
   - Trace les routes (`roads.ts`) en échantillons tous les 2,5 u ; une route "assèche" l'eau
     qu'elle traverse (= pont / chaussée).
   - Calcule la **distance signée à la côte** et la **distance à la route** (transformées de distance).
2. **Heightfield** : hauteur de chaque sommet, calculée **à la demande** puis mise en cache :
   relief naturel (rampe côtière + collines + massifs de `relief.ts` + falaises) → aplanissement
   des villes (jamais sur l'eau) → tampons des monuments et des gares → profil lissé des routes
   (hors chaussée, l'eau reste de l'eau).
   `heightAt(x,z)` interpole **exactement comme le mesh** (même diagonale de triangle) :
   personne ne flotte ni ne s'enfonce.
3. **TerrainChunks** : carrés de 32 × 32 cellules (160 u) générés autour du joueur
   (rayon 3 chunks ≈ 500 u), 1 par frame max, déchargés en s'éloignant.
4. **Scatter** : arbres, buissons, rochers semés de façon déterministe sur chaque chunk
   (InstancedMesh + collisions), hors routes, villes et zones des monuments.
5. **Towns** : toutes les maisons du pays en 2 draw calls (instancing + couleur par instance).
6. **Roads** : un seul mesh pour toutes les routes.
7. **LandmarkManager** : construit les monuments à < 650 u (1 par frame), les détruit à > 800 u,
   et appelle leur `animate` (cascades, dauphin) tant qu'ils sont chargés.
8. **Stations** : les 4 gares (toujours chargées) ; **ZoneGates** : barrières "ZONE VERROUILLÉE"
   calculées aux points où une route franchit une frontière de zone.

### Coordonnées

- `lonLatToWorld(lon, lat)` : projection équirectangulaire centrée sur (−8°, 53,4°).
  **x = est, z = sud, y = haut.** 1° de latitude = 1 500 u. Altitude : 1 m réel = 0,06 u.
- Les monuments ont un **repère local** : origine au sol au point GPS, tourné de `rotationDeg`.
  `localToWorld()` (LandmarkManager) fait la conversion, avec la même convention que three.js.

## 3 bis. Zones, progression, économie

- `world/data/zones.ts` : 4 zones = polygones lat/lon (mer comprise) + ordre + gare. La dernière
  (`fallback`) prend tout ce qui reste.
- `systems/Zones.ts` : `zoneAt(x, z)` (point dans polygone) et `canEnter(x, z)` = **mur invisible**
  (zone fermée ou hors carte). `canEnter` est passé dans `WorldRefs` à `moveEntity` / `findNearest` :
  il s'applique à tout ce qui bouge (joueur, mouton, véhicules, ULM).
- `systems/Progression.ts` : pièces (`ECONOMY`), achat des véhicules, ouverture des zones
  (tous les ☆ de la zone N → zone N+1). Les zones ouvertes sont stockées dans la sauvegarde.
- La zone d'un lieu n'est PAS une donnée du lieu : elle est calculée au chargement depuis ses
  coordonnées (`Game.landmarkZone`).

## 4. Collisions & déplacements

Volontairement simple et robuste (pas de moteur physique) :

- **Relief** : on ne peut pas monter une pente > `maxSlope`, ni sauter d'une falaise
  (descente > 1,8 × maxSlope), ni entrer dans l'eau au-delà de `maxWade` (sauf bateau,
  qui exige ≥ 0,8 u de fond). Logique dans `entities/movement.ts → moveEntity()`.
- **Obstacles** : `Colliders` = cercles et boîtes orientées en 2D (vue de dessus), indexés dans
  une grille de hachage de 16 u, avec un `owner` pour les retirer en bloc
  (`scatter:<chunk>`, `town:<nom>`, `landmark:<id>`).
- Le personnage, le mouton et les véhicules utilisent la même fonction : comportement cohérent.
- **Vol (ULM)** : `medium: 'air'` ignore relief, eau et obstacles mais pas le mur des zones ;
  l'altitude est gérée par `Player.updateAltitude` (suit le relief avec anticipation).

## 5. Rendu

- Matériaux partagés (`materials.ts`) : `world` (Lambert, couleurs par sommet), `terrain`
  (Lambert à facettes), `character` (Toon 3 paliers), `road`, `glow`, `water` (eau décorative
  transparente), `foam` (écume), `bronze` (statues).
- `ModelBuilder` fusionne toutes les pièces d'un modèle en **une géométrie** (1 draw call)
  avec couleurs par sommet ; les primitives unitaires sont mises en cache.
- Ombres : 1 lumière directionnelle (soleil/lune) dont la caméra d'ombre suit le joueur (±45 u).
- Ciel : sphère avec shader dégradé + halo solaire ; brouillard = couleur d'horizon.
- Eau : un plan unique au niveau 0 qui suit le joueur, normal map procédurale qui défile.

## 6. Données de partie

- `SaveData` (`core/save.ts`) dans `localStorage` clé `eirelens.save.v1` : position, véhicule,
  heure, personnalisation, monuments photographiés (meilleure note), **pièces, véhicules achetés,
  zones ouvertes**, stats, réglages. Position `NaN` = nouvelle partie (posé devant la 1re gare).
  Champs manquants complétés automatiquement → on peut ajouter des champs sans casser les sauvegardes.
- Photos (JPEG 480 px) dans IndexedDB (`core/photoStore.ts`).

## 7. UI

- `uiStore` : petit store observable. Le moteur l'écrit (≤ 10×/s pour le HUD), React le lit via
  `useUi(selector)` (**le sélecteur doit renvoyer une valeur existante du store, pas un nouvel objet**).
- Navigation manette/clavier dans les menus : `useMenuNav()` / `useGameAction()`.
- Écrans : `loading`, `title`, `play` (HUD), `photo`, `album`, `map`, `pause`, `customize`,
  `vehicles` (garage / achat), `train` (guichet), `travel` (fondu du voyage) — table `SCREENS`
  dans `ui/GameView.tsx`.
- Tactile : `TouchControls.tsx` écrit dans `input.virtual` ; masqué dès qu'une manette sert.

## 8. Budget de performance (cible iPad Pro 2020)

| Poste | Mesuré (socle) | Plafond |
|---|---|---|
| Draw calls | ~80 | 150 |
| Triangles (ombres incluses) | ~330 k | 400 k |
| Génération d'un chunk | ~3,5 ms | 6 ms |
| Construction d'un monument | 2–15 ms | 20 ms |
| Logique par frame (hors rendu) | < 0,1 ms | 2 ms |
| Mémoire JS | ~70 Mo | 300 Mo |

Règles : instancing au-delà de ~50 objets identiques ; aucune allocation dans les `update()` ;
pas de nouveau matériau par objet ; pas de lumière dynamique supplémentaire (PointLight interdite).

## 9. Outils

- `tools/build_geo.py` : régénère `irelandGeo.json` depuis Natural Earth (Python + shapely).
  **Inutile au quotidien.** Ne pas lancer depuis AI Studio.
- Console navigateur : `__eirelens` (instance de Game) et `__eirelensUi` (store UI).
  Voir AGENTS.md §5 pour les commandes de débogage.
- **Atelier 3D** : `?atelier` (ou bouton de l'écran titre). `__atelier` dans la console.

## 10. Limites connues (honnêtes)

- Testé en rendu logiciel (SwiftShader) et par revue de code ; **la fluidité réelle sur iPad reste
  à valider** sur l'appareil (réglage "Économie" disponible en cas de besoin).
- Dans l'aperçu intégré d'AI Studio (iframe), la manette et le plein écran peuvent être bloqués
  par le navigateur : tester dans un **nouvel onglet** ou sur l'URL déployée.
- Les coordonnées de quelques monuments côtiers sont décalées de quelques centaines de mètres
  pour coller au trait de côte simplifié (commentaire dans le fichier concerné).
- Pas de collision sur les petites marches de la Chaussée des Géants (purement visuelles).
- Les frontières des zones sont tracées à la main (précision ~2-5 km) : un lieu près d'une
  frontière peut tomber dans la zone voisine → vérifier dans l'album, corriger `zones.ts`.
- La photo n'est pas cachée par les feuillages (seuls relief et obstacles bloquent la vue).
- Les lacs décoratifs (Glendalough, Connemara, Glenveagh) sont posés sur un relief aplani ;
  le lac de Glendalough est en terrasse au-dessus du monastère (le relief du jeu ne creuse pas
  de vallées glaciaires).
