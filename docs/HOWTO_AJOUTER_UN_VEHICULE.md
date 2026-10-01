# Ajouter un véhicule

Fichiers concernés : `src/content/vehicles/<id>.ts` (nouveau) + `src/content/vehicles/index.ts`.
Pour le modèle 3D (pivots, roues, pattes animées…), lis aussi **`docs/GUIDE_MODELISATION.md`**.

Exemples à copier :

| Fichier | Ce qu'il montre |
|---|---|
| `bicycle.ts` | terrestre, roues animées, mouton dans le panier |
| `horse.ts` | **animal** : pattes à pivot (épaule/hanche), trot, tête qui hoche, mouton sur la croupe, pose "ride" |
| `currach.ts` | bateau (`medium: 'water'`), roulis |
| `ulm.ts` | **volant** (`medium: 'air'` + `flight`), hélice, inclinaison en virage, mouton suspendu (`pose: 'hang'`) |

## 1. Définition

```ts
export const jauntingCar: VehicleDef = {
  id: 'jaunting_car',            // unique, définitif (jamais renommé : il est dans les sauvegardes)
  name: 'Jaunting car',
  description: 'La carriole à cheval de Killarney.',
  icon: '🐴',
  price: 500,                    // en pièces (voir ECONOMY dans gameConfig.ts)
  medium: 'land',                // 'land' | 'water' | 'air'
  maxSpeed: 12, acceleration: 6, turnRate: 1.6,
  maxSlope: 0.8,                 // 1 = 45°
  radius: 1.4,                   // collision
  rider: { offset: [0.4, 1.1, -0.6], pose: 'sit' },                // 'sit' | 'ride' | 'bike' | 'hidden'
  sheepSeat: { offset: [-0.5, 1.2, -0.6], scale: 0.7, pose: 'sit' }, // ou null ; pose 'sit' | 'hang'
  cameraDistance: 14,
  build() { /* ModelBuilder… renvoie un THREE.Object3D, avant = +Z, origine au sol */ },
  animate(model, speed, dt, time) { /* optionnel : roues, pattes, hélice… */ },
};
```

Puis ajoute-le à `VEHICLES` dans `index.ts`. Le garage (achat), la sauvegarde, la conduite,
la caméra et le mouton à bord fonctionnent automatiquement.

## 2. Repères de réglage

| Véhicule | prix | maxSpeed | acceleration | turnRate | maxSlope |
|---|---|---|---|---|---|
| Marche | — | 6 | — | — | 1.25 |
| Galop sur le mouton | — | 13 | — | — | 1.25 |
| Vélo | 150 | 15 | 10 | 3.2 | 0.9 |
| Cheval | 450 | 19 | 9 | 3.0 | 1.3 |
| Bateau (currach) | 600 | 20 | 7 | 1.8 | — |
| ULM | 1200 | 30 | 8 | 1.6 | 0.5 (au sol) |

Équilibre économique : une photo 3★ rapporte 120 (principal), 80 (secondaire) ou 60 (bonus).
Le bateau doit rester achetable AVANT l'Ouest (les îles d'Aran sont un lieu principal).

## 3. Véhicule volant (`medium: 'air'`)

Ajoute le bloc `flight` :

```ts
flight: { cruiseHeight: 32, takeoffSpeed: 13, climbRate: 9 },
```

- Au sol, il roule comme un véhicule terrestre (pente max `maxSlope`).
- Au-delà de `takeoffSpeed`, il décolle et suit le relief à `cruiseHeight` au-dessus du sol
  (il anticipe les montagnes devant lui).
- Stick relâché au-dessus de la terre : il ralentit et se pose. Au-dessus de l'eau, il continue
  de planer (pas d'amerrissage).
- Pendant la photo et les menus, il reste immobile en l'air.
- Les murs des zones verrouillées s'appliquent aussi en vol.

Toute cette logique est dans `entities/Player.ts` (`updateFlightState`, `updateAltitude`) :
un nouveau véhicule volant n'a besoin que de ses données.

## 4. Test

1. **Atelier 3D** (bouton de l'écran titre, ou `?atelier=vehicle:<id>`) : vérifie l'échelle à côté
   du personnage, la place du pilote et du mouton, l'animation (curseur "Vitesse").
2. En jeu, console : `__eirelens.debugMoney(2000)` → menu Véhicules (V / X) → acheter (2 appuis)
   → monter → rouler sur route, en pente, contre un mur, au bord de l'eau → descendre.
   Aucune erreur console.
