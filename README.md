# EireLens 🐑📷

Balade contemplative en **3D low-poly** dans une **Irlande miniature** fidèle à la vraie
géographie, avec un **mouton de compagnie** un peu râleur. Le but : photographier les lieux
emblématiques de l'île (Falaises de Moher, Chaussée des Géants, Rocher de Cashel, Skellig Michael…),
débloquer des moyens de transport et remplir l'album.

Jouable au clavier, à la **manette** et au **tactile**, dans le navigateur, en plein écran sur **iPad**.

## Démarrer en local

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # vérification TypeScript
npm run build    # version de production dans dist/
```

## Commandes

| | Manette | Clavier |
|---|---|---|
| Marcher / caméra | sticks | ZQSD-WASD / flèches, souris |
| Galoper sur le mouton | maintenir B | maintenir Maj |
| Appareil photo / déclencher | Y / A | C / Espace |
| Zoom | RT / LT | E / A, molette |
| Véhicules · Carte · Album · Pause | X · Select · ↓ · Start | V · M · B · Échap |

## Documentation

| Pour… | Lire |
|---|---|
| **L'IA qui développe (Gemini / AI Studio)** — à lire en premier | [`AGENTS.md`](AGENTS.md) |
| Comprendre le jeu | [`docs/GDD.md`](docs/GDD.md) |
| Comprendre le code | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Ajouter un monument / un véhicule | [`docs/HOWTO_AJOUTER_UN_MONUMENT.md`](docs/HOWTO_AJOUTER_UN_MONUMENT.md) · [`docs/HOWTO_AJOUTER_UN_VEHICULE.md`](docs/HOWTO_AJOUTER_UN_VEHICULE.md) |
| Savoir quoi faire ensuite (prompts prêts à coller) | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Mettre en ligne (GitHub, AI Studio, iPad) | [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) |

## Crédits

- Contours de l'Irlande, lacs et Shannon : [Natural Earth](https://www.naturalearthdata.com/) (domaine public),
  convertis par `tools/build_geo.py`.
- Tout le reste (modèles 3D, sons, musique) est généré en code.
