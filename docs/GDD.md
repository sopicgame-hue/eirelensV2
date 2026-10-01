# EireLens — Game Design Document

> Version 1.0 — socle posé le 1er octobre 2026. Ce document décrit **ce que le jeu doit être**.
> Toute nouvelle fonctionnalité doit servir les piliers ci-dessous ; sinon, elle n'entre pas.

---

## 1. Vision

**Une carte postale vivante de l'Irlande, à parcourir sans stress, un appareil photo à la main
et un mouton un peu râleur dans les pattes.**

- Genre : exploration contemplative / chasse photo (inspirations : *Pokémon Snap*, *Alba: A Wildlife
  Adventure*, *A Short Hike*, l'Amérique miniature de *The Crew*).
- Ton : doux, drôle par petites touches, jamais punitif. Pas de chrono, pas de mort, pas d'échec.
- Session type : 10 à 30 minutes sur iPad, canapé, manette en main.

## 2. Les 4 piliers (filtre de décision)

| Pilier | Ce que ça implique | Ce que ça interdit |
|---|---|---|
| **Flâner** | Se déplacer est agréable en soi : paysages, lumière, musique douce. | Combats, ennemis, jauges de survie, pression temporelle. |
| **Reconnaître l'Irlande** | Géographie réelle (côtes, lacs, montagnes, routes) compressée façon *The Crew*. Les monuments sont reconnaissables. | Monuments inventés, géographie fantaisiste. |
| **Photographier** | La photo est LA mécanique : cadrer, attendre la bonne heure, revenir avec un meilleur véhicule. | Photos "automatiques", validation sans cadrage. |
| **Le mouton** | Compagnon comique omniprésent, jamais gênant. | Mouton qui bloque, qui se perd, qui agace. |

## 3. Boucle de jeu

```
Explorer (à pied, au galop sur le mouton, en véhicule)
   → repérer un monument (boussole, carte, panorama)
   → trouver le bon point de vue, la bonne heure
   → photographier (★ à ★★★)
   → l'album se remplit, le mouton commente
   → débloquer un véhicule → accéder à de nouvelles zones (îles en bateau)
   → explorer plus loin…
```

## 4. Le monde

- **Géographie** : île d'Irlande entière (République + Irlande du Nord), contours réels
  (Natural Earth), 12 grands lacs, le Shannon, ~50 massifs montagneux, 12 zones de falaises,
  ~80 villes/villages, ~40 routes principales.
- **Échelle** : 1° de latitude = 1 500 u. Nord-sud ≈ 6 000 u ≈ 17 min à pied, 3 min en voiture.
  Relief exagéré ×4,4 en hauteur (Carrauntoohil, 1 038 m, culmine à ~60 u) pour rester lisible.
- **Point de départ** : Doolin (Clare), à 80 m des Falaises de Moher et à 15 min à pied du Burren
  — trois monuments faciles pour apprendre la boucle.
- **Cycle jour/nuit** : 20 minutes réelles par journée. L'aube et le coucher de soleil donnent
  un bonus photo ("heure dorée"). La nuit reste lisible (lune, phares allumés).

## 5. Contrôles

| Action | Manette | Clavier | Tactile |
|---|---|---|---|
| Se déplacer | Stick gauche | ZQSD / WASD | Joystick gauche |
| Caméra | Stick droit | Flèches / glisser la souris | Glisser à droite |
| Galoper (sur le mouton) | Maintenir B | Maintenir Maj | 🐑 |
| Caresser le mouton / valider | A | Espace / F | A |
| Appareil photo | Y | C | 📷 |
| Déclencher | A (ou RB) | Espace | 📷 |
| Zoom photo | RT / LT | E / A (molette) | + / − |
| Véhicules | X | V | 🚲 |
| Carte | Select | M | 🗺 |
| Album | Croix ↓ | B | (menu pause) |
| Appeler le mouton | Croix ↑ | R | — |
| Pause | Start | Échap | ☰ |

## 6. La photo (mécanique centrale)

- Mode photo = vue subjective, grille des tiers, zoom ×0,7 à ×3,5.
- **Validation** : le point focal du monument doit être dans le cadre, à bonne distance,
  non caché par le relief ni par un obstacle.
- **Qualité** (jauge jaune en direct dans le viseur) = taille du sujet (60 %) + centrage (40 %),
  + 15 % pendant l'heure dorée ou les heures spéciales du monument.
- **Étoiles** : ★ valide, ★★ > 55 %, ★★★ > 80 %. On garde la meilleure photo par monument.
- **Photobomb** : 1 fois sur 4, le mouton court se mettre dans le cadre et saute. La photo reste
  valide et reçoit la mention "🐑 avec la participation de ton mouton" (compteur dans l'album).
- **Album** façon Pokédex : monuments numérotés, silhouettes "???" pour les non découverts,
  description + anecdote débloquée à la première photo.

## 7. Le mouton (ressort comique)

| Comportement | Déclencheur |
|---|---|
| Suit le joueur, légèrement décalé pour rester visible | Toujours |
| Broute, regarde le joueur, remue la queue | À l'arrêt |
| Réplique pince-sans-rire (boîte de dialogue façon Pokémon) | Toutes les ~45 s à l'arrêt, et à chaque événement |
| Se téléporte derrière le joueur ("Raccourci secret !") | S'il est semé ou coincé |
| Se fait chevaucher (galop, 13 u/s) et s'en plaint | Maintenir "Galoper" |
| Voyage dans le panier du vélo, sur la banquette de la Mini, à la proue du currach | Véhicules |
| Photobomb | Mode photo |
| Saute de joie | Caresse |
| Personnalisable : nom, écharpe / nœud papillon / casquette | Écran personnalisation |

Toutes les répliques sont dans `src/content/sheepLines.ts` : en ajouter est le moyen le plus
simple d'enrichir le jeu. Ton : court, sec, affectueux. Jamais méchant.

## 8. Progression & véhicules

| Véhicule | Débloqué à | Vitesse | Particularité |
|---|---|---|---|
| À pied | départ | 6 u/s | Peut tout escalader jusqu'à 51° |
| Galop sur le mouton | départ | 13 u/s | Maintenir le bouton |
| Vélo à panier | 2 monuments | 15 u/s | Mouton dans le panier |
| Mini rétro | 5 monuments | 32 u/s | Ne monte pas les pentes raides |
| Currach | 7 monuments | 20 u/s | Sur l'eau uniquement → îles (Skellig, Fastnet, Aran) |
| *(à venir)* Montgolfière | 15 monuments | 18 u/s | Vol libre, photos aériennes |
| *(à venir)* Jaunting car | 10 monuments | 12 u/s | Carriole à cheval, Killarney |

## 9. Contenu : les monuments

34 lieux sont référencés (`src/content/landmarks/`). **9 sont modélisés**, les autres utilisent un
**cairn provisoire** (déjà photographiables, à remplacer un par un — voir `docs/ROADMAP.md`).

Modélisés : Falaises de Moher, Chaussée des Géants, Dolmen de Poulnabrone, Rocher de Cashel,
Phare du Fastnet, Dark Hedges, Glendalough, Newgrange, Skellig Michael.

Provisoires : Château de Dunluce, Abbaye de Kylemore, Croagh Patrick, Benbulbin, Slieve League,
Carrick-a-Rede, Blarney, Kilkenny, Bunratty, Dún Aonghasa, Ross Castle, Gap of Dunloe,
Clonmacnoise, Hook Head, Mizen Head, Malin Head, Errigal, Temple Bar, Titanic Belfast,
Dunguaire, Colline de Tara, Ashford Castle, Temple de Mussenden, Carrauntoohil, Fanad Head.

Critères pour ajouter un lieu : **emblématique** (reconnu par un touriste), **visuellement
distinctif** en low-poly, **réparti** sur la carte (éviter les grappes).

## 10. Direction artistique

- Low-poly à facettes, couleurs saturées et lumineuses, ombres douces (cel-shading 3 paliers
  sur les personnages). Référence : Pokémon Ultra Soleil/Lune.
- Personnages "chibi" : grosse tête, petit corps, yeux simples.
- Palette centralisée (`palette.ts`). L'Irlande = "40 nuances de vert" (parcelles de champs),
  calcaire gris du Burren, tourbières brunes, bruyère mauve des montagnes, façades colorées des villes.
- UI : boîtes à bord blanc épais et coins arrondis, typographie ronde (Nunito), icônes emoji.

## 11. Audio

100 % procédural (aucun fichier) : harpe pentatonique générative, vent, bêlements, déclencheur
photo, jingles. Volume musique / effets dans le menu pause.

## 12. Plateformes & performances

- Navigateurs récents ; **cible prioritaire : iPad Pro 2020 (A12Z) en Safari plein écran**.
- Budget : 60 i/s, < 150 draw calls, < 400 k triangles (ombres comprises), < 300 Mo de mémoire.
- Réglage "Qualité : Économie" : pas d'ombres, résolution 1×, rayon de chargement réduit.
- Plein écran iPad : bouton "Plein écran" ou, mieux, **Safari → Partager → Sur l'écran d'accueil**.

## 13. Hors périmètre (volontairement)

Combats, multijoueur, achats, IA générative en jeu, monde ouvert à l'échelle 1:1, intérieurs de bâtiments.
