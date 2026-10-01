# Mise en ligne : Mac → GitHub → Google AI Studio → iPad

Procédure à faire **une seule fois**. Chaque étape nomme le fichier/dossier exact.

Dossier du projet sur ton Mac : **`/Users/YLotton/Documents/Perso/App/EireLens/eirelens`**
(le dépôt git y est déjà initialisé avec un premier commit sur la branche `main`).
L'ancien prototype AI Studio est resté intact dans
`/Users/YLotton/Documents/Perso/App/EireLens/eirelens---2d-ireland-safari` (à archiver ou supprimer toi-même).

---

## Étape 1 — Créer le dépôt GitHub (navigateur)

1. https://github.com/new
2. Repository name : **`eirelens`** — Visibilité : **Private** (voir la remarque de l'étape 3).
3. **Ne coche rien** (pas de README, pas de .gitignore, pas de licence) → *Create repository*.
4. Copie l'URL HTTPS affichée : `https://github.com/<ton-compte>/eirelens.git`.

## Étape 2 — Pousser le projet (Terminal sur le Mac)

```bash
cd /Users/YLotton/Documents/Perso/App/EireLens/eirelens
git remote add origin https://github.com/<ton-compte>/eirelens.git
git push -u origin main
```

Si Git demande un mot de passe : il faut un **jeton** (GitHub → Settings → Developer settings →
Personal access tokens → *Fine-grained* → accès au dépôt `eirelens`, permission *Contents: Read and write*),
à coller à la place du mot de passe. Alternative sans terminal : **GitHub Desktop** → *File → Add Local
Repository* → choisir le dossier ci-dessus → *Publish repository*.

## Étape 3 — Importer dans Google AI Studio

1. https://aistudio.google.com → **Build**.
2. Dans la zone de saisie du prompt : menu **+ (Add files)** → **Import from GitHub** → autoriser
   GitHub → choisir `eirelens`.
3. Une fois le projet ouvert : **Settings → onglet GitHub** → lier le dépôt `eirelens` (synchronisation
   dans les deux sens : *Push* depuis AI Studio, *Pull* des changements externes).

⚠ Points non documentés par Google à ce jour (à vérifier de ton côté) : support des dépôts **privés**
à l'import et éventuelles "normalisations" du projet. Si l'import privé échoue, passe le dépôt en
public (il ne contient aucun secret) ou importe le zip (*Add files*).

4. Premier prompt : colle le **prompt d'amorçage** (`AGENTS.md` §7) + la tâche **T0.1** de
   `docs/ROADMAP.md`. Vérifie que l'aperçu affiche l'écran titre.

## Étape 4 — Jouer sur iPad (GitHub Pages, gratuit, recommandé)

Le jeu est 100 % statique (pas de serveur, pas de clé API) : GitHub Pages suffit.

1. GitHub → dépôt `eirelens` → **Settings → Pages** → *Build and deployment* → Source : **GitHub Actions**.
2. Le fichier **`.github/workflows/deploy-pages.yml`** (déjà présent) compile et publie le jeu à chaque
   push sur `main`. Suivi : onglet **Actions** du dépôt (2 à 3 min).
3. URL : **`https://<ton-compte>.github.io/eirelens/`**
4. Sur l'iPad : Safari → ouvrir l'URL → bouton **Partager** → **Sur l'écran d'accueil**.
   L'icône lance le jeu **en plein écran**, sans barre Safari.
5. Manette : iPad **Réglages → Bluetooth** → appairer la manette (Xbox / PlayStation / 8BitDo).
   Dans le jeu, appuie sur un bouton de la manette : les commandes tactiles disparaissent.

⚠ Un dépôt **privé** ne peut publier sur GitHub Pages qu'avec un compte GitHub payant.
Avec un compte gratuit : dépôt public, ou utilise le déploiement AI Studio (étape 5).

## Étape 5 (alternative) — Déployer depuis AI Studio

Bouton **Deploy** d'AI Studio → Cloud Run. Peut entraîner une facturation Google Cloud selon l'usage.
Le jeu n'utilise pas l'API Gemini : aucune clé n'est nécessaire.

## À savoir

- **Aperçu AI Studio** : il tourne dans une iframe ; la manette et le plein écran peuvent y être
  bloqués par le navigateur. Teste ces deux points sur l'URL publiée ou dans un nouvel onglet.
- **Sauvegardes** : stockées dans le navigateur (par appareil et par URL). Changer d'URL = nouvelle partie.
- **Retour arrière** : chaque push GitHub est un point de restauration (onglet *Commits*).
