# EireLens — Game Design Document

> Version 1.1 — 1er octobre 2026 : zones, trains, économie (pièces), cheval et ULM, liste de lieux de Yann. Ce document décrit **ce que le jeu doit être**.
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
Explorer une zone (à pied, au galop sur le mouton, en véhicule)
   → repérer un lieu (boussole, carte : les lieux ☆ principaux sont nommés)
   → trouver le bon point de vue, la bonne heure
   → photographier (★ à ★★★) → gagner des pièces 🪙
   → acheter un véhicule (vélo, cheval, bateau, ULM) → atteindre les lieux difficiles (îles, sommets)
   → tous les lieux ☆ de la zone photographiés → la zone suivante s'ouvre
   → prendre le train à la gare → explorer la nouvelle zone…
```

## 4. Le monde

- **Géographie** : île d'Irlande entière (République + Irlande du Nord), contours réels
  (Natural Earth), 12 grands lacs, le Shannon, ~50 massifs montagneux, 12 zones de falaises,
  ~80 villes/villages, ~40 routes principales.
- **Échelle** : 1° de latitude = 1 500 u. Nord-sud ≈ 6 000 u ≈ 17 min à pied, 3 min en voiture.
  Relief exagéré ×4,4 en hauteur (Carrauntoohil, 1 038 m, culmine à ~60 u) pour rester lisible.
- **Point de départ** : devant la gare de Killarney (Kerry), dans la zone du Sud : le château de
  Ross, la cascade de Torc et le Gap of Dunloe sont à quelques minutes, Dingle (Fungie) et Cashel
  plus loin.
- **Cycle jour/nuit** : 20 minutes réelles par journée. L'aube et le coucher de soleil donnent
  un bonus photo ("heure dorée"). La nuit reste lisible (lune, phares allumés).

## 4 bis. Zones, gares et trains

La carte est découpée en **4 zones**, ouvertes dans cet ordre :

| Ordre | Zone | Gare | Couvre |
|---|---|---|---|
| 1 | **Le Sud** | Killarney | Kerry, Cork, Limerick, Tipperary, Waterford, Kilkenny, Wexford |
| 2 | **L'Irlande du Nord** | Belfast | Les 6 comtés d'Irlande du Nord |
| 3 | **L'Ouest et le Nord-Ouest** | Galway | Clare, Galway, Mayo, Sligo, Leitrim, Donegal, Roscommon, rive du Shannon (Clonmacnoise) |
| 4 | **Dublin et ses environs** | Dublin (Heuston) | Dublin, Wicklow, Meath, Louth, Kildare, Cavan, Midlands |

- Une zone s'ouvre quand **tous les lieux ☆ principaux** de la zone précédente ont au moins une étoile.
  Une zone ouverte le reste pour toujours.
- **Zone verrouillée** = mur invisible (à pied, à cheval, en bateau ET en ULM), habillé par une
  barrière jaune "ZONE VERROUILLÉE" sur chaque route qui franchit la frontière, et un panneau
  qui explique quoi faire quand on bute dessus.
- **Train** : une gare par zone. Près d'une gare, A (Espace / 🚂) ouvre le guichet ; on voyage vers
  n'importe quelle gare de zone ouverte (fondu au noir, petit train qui défile). Le Sud et le Nord
  ne se touchent pas : on y va en train.
- Les frontières sont des données (`src/world/data/zones.ts`, points lat/lon) : faciles à retoucher.

## 5. Contrôles

| Action | Manette | Clavier | Tactile |
|---|---|---|---|
| Se déplacer | Stick gauche | ZQSD / WASD | Joystick gauche |
| Caméra | Stick droit | Flèches / glisser la souris | Glisser à droite |
| Galoper (sur le mouton) | Maintenir B | Maintenir Maj | 🐑 |
| Caresser le mouton / valider / prendre le train | A | Espace / F | A (♥ / 🚂) |
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
- **Récompense** : pièces selon l'importance du lieu × étoiles (voir §8). Refaire une meilleure
  photo paie la différence.
- **Vue subjective** (première personne, comme Pokémon Snap) : le personnage disparaît, on voit
  par l'objectif. Depuis l'ULM, la photo se prend en plein vol (l'ULM se fige le temps du cadrage).
- **Album** façon Pokédex : un onglet par zone (☆ principaux d'abord), silhouettes "???" pour les
  lieux non découverts (sauf les ☆, toujours nommés : ce sont les objectifs), description + anecdote
  débloquée à la première photo, + onglet "Pellicule".

## 7. Le mouton (ressort comique)

| Comportement | Déclencheur |
|---|---|
| Suit le joueur, légèrement décalé pour rester visible | Toujours |
| Broute, regarde le joueur, remue la queue | À l'arrêt |
| Réplique pince-sans-rire (boîte de dialogue façon Pokémon) | Toutes les ~45 s à l'arrêt, et à chaque événement |
| Se téléporte derrière le joueur ("Raccourci secret !") | S'il est semé ou coincé |
| Se fait chevaucher (galop, 13 u/s) et s'en plaint | Maintenir "Galoper" |
| Voyage dans le panier du vélo, sur la croupe du cheval, à la proue du bateau, **suspendu sous l'ULM** | Véhicules |
| Photobomb | Mode photo |
| Saute de joie | Caresse |
| Personnalisable : nom, écharpe / nœud papillon / casquette | Écran personnalisation |

Toutes les répliques sont dans `src/content/sheepLines.ts` : en ajouter est le moyen le plus
simple d'enrichir le jeu. Ton : court, sec, affectueux. Jamais méchant.

## 8. Progression, économie & véhicules

**Pièces 🪙** (réglages : `ECONOMY` dans `gameConfig.ts`) :

| Importance du lieu | ★ | ★★ | ★★★ |
|---|---|---|---|
| ☆ Principal | 60 | 90 | 120 |
| ◉ Secondaire | 40 | 60 | 80 |
| ♥ Bonus | 30 | 45 | 60 |

**Véhicules** (achetés au menu Véhicules, 2 appuis pour confirmer) :

| Véhicule | Prix | Vitesse | Particularité |
|---|---|---|---|
| À pied | — | 6 u/s | Peut tout escalader jusqu'à 51° |
| Galop sur le mouton | — | 13 u/s | Maintenir le bouton |
| Vélo à panier | 150 | 15 u/s | Mouton dans le panier |
| Cheval (poney du Connemara) | 450 | 19 u/s | Passe partout (pentes), mouton sur la croupe |
| Bateau (currach) | 600 | 20 u/s | Sur l'eau uniquement → îles (Aran ☆, Skellig, Fastnet) |
| ULM | 1 200 | 30 u/s | Vole à ~32 u au-dessus du relief, photos aériennes, mouton suspendu dessous |

Équilibre visé : le vélo s'achète après 2 photos ; le bateau avant l'Ouest (les îles d'Aran y sont
un lieu principal) ; l'ULM pendant l'Ouest ou à Dublin. Total possible ≈ 4 300 pièces pour
2 400 de véhicules : pas besoin de tout photographier pour tout acheter.

## 9. Contenu : les lieux

**52 lieux**. Ceux de la liste de départ (Yann) et les monuments de ville demandés sont
obligatoires ; les "propositions" peuvent être retirées (`docs/HOWTO_AJOUTER_UN_MONUMENT.md`, cas C).

| Zone | ☆ Principaux (obligatoires) | ◉ Secondaires | ♥ Bonus |
|---|---|---|---|
| **Le Sud** | Fungie (Dingle), Rocher de Cashel | Château du roi Jean (Limerick), Château de Ross, Château de Kilkenny, Cathédrale St Fin Barre's (Cork), Tour de Reginald (Waterford) · *propositions :* Blarney, Gap of Dunloe | Cascade de Torc · *propositions :* Skellig Michael, Fastnet, Mizen Head, Carrauntoohil, Hook Head |
| **L'Irlande du Nord** | Titanic Belfast, Chaussée des Géants | Église et puits de Cranfield, Peace Bridge (Derry), Hôtel de ville de Belfast · *propositions :* Dunluce, Carrick-a-Rede, Dark Hedges | Cascade d'Ess-na-Crub (Glenariff) · *proposition :* Mussenden |
| **L'Ouest et le Nord-Ouest** | Wormhole (Inis Mór, Aran), Église des Nonnes (Clonmacnoise), Falaises de Moher, Connemara, Glenveagh | Jetée de Nimmo (Galway), Lough Conn Drive · *propositions :* Poulnabrone, Dún Aonghasa, Kylemore, Croagh Patrick, Benbulbin, Bunratty | Slieve League · *propositions :* Dunguaire, Ashford, Errigal, Malin Head, Fanad Head |
| **Dublin et ses environs** | Newgrange, Phare du Baily (Howth), Glendalough (site + lac) | Village des mineurs, Cairns de Loughanleagh, Ha'penny Bridge et Temple Bar · *proposition :* Colline de Tara | Cascade de Powerscourt |

Monuments de ville (demandés par Yann) : Ha'penny Bridge + Temple Bar (un seul lieu : à 100 m
l'un de l'autre, ils se chevaucheraient à l'échelle du jeu), Hôtel de ville de Belfast, St Fin
Barre's, Tour de Reginald. Comme toutes les routes d'une ville convergent vers son centre, ces
monuments sont **décalés de 20 à 50 u** hors des routes (coordonnées réelles en commentaire).

État : **tous les lieux de la liste de départ et les monuments de ville sont modélisés**. Les propositions encore en cairn
provisoire (photographiables) : Blarney, Gap of Dunloe, Mizen Head, Carrauntoohil, Hook Head,
Dunluce, Carrick-a-Rede, Mussenden, Dún Aonghasa, Kylemore, Croagh Patrick, Benbulbin, Bunratty,
Dunguaire, Ashford, Errigal, Malin Head, Fanad Head, Colline de Tara
(fiches prêtes dans `docs/ROADMAP.md`).

Critères pour ajouter un lieu : **emblématique**, **visuellement distinctif** en low-poly, à plus
de ~1 km d'un autre lieu (sinon les modèles se chevauchent), et lui donner une **importance**.

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

Combats, multijoueur, achats en argent réel, IA générative en jeu, monde ouvert à l'échelle 1:1, intérieurs de bâtiments.
