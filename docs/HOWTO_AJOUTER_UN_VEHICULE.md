# Ajouter un véhicule

Fichiers concernés : `src/content/vehicles/<id>.ts` (nouveau) + `src/content/vehicles/index.ts`.
Exemples à copier : `bicycle.ts` (terrestre, roues animées), `currach.ts` (aquatique, roulis).

## 1. Définition

```ts
export const jauntingCar: VehicleDef = {
  id: 'jaunting_car',            // unique, définitif
  name: 'Jaunting car',
  description: 'La carriole à cheval de Killarney. Paddy adore le cheval.',
  icon: '🐴',
  unlockAt: 10,                  // nb de monuments photographiés
  medium: 'land',                // 'land' ou 'water'
  maxSpeed: 12, acceleration: 6, turnRate: 1.6,
  maxSlope: 0.8,                 // 1 = 45°
  radius: 1.4,                   // collision
  rider: { offset: [0.4, 1.1, -0.6], pose: 'sit' },   // 'sit' | 'bike' | 'hidden'
  sheepSeat: { offset: [-0.5, 1.2, -0.6], scale: 0.7 }, // ou null
  cameraDistance: 14,
  build() { /* ModelBuilder… renvoie un THREE.Object3D, avant = +Z, origine au sol */ },
  animate(model, speed, dt, time) { /* optionnel : roues, cheval qui trotte… */ },
};
```

Puis ajoute-le à `VEHICLES` dans `index.ts`. Le menu, le déblocage, la sauvegarde, la conduite,
la caméra et le mouton à bord fonctionnent automatiquement.

## 2. Repères de réglage

| Véhicule | maxSpeed | acceleration | turnRate | maxSlope |
|---|---|---|---|---|
| Marche | 6 | — | — | 1.25 |
| Vélo | 15 | 10 | 3.2 | 0.9 |
| Voiture | 32 | 14 | 2.2 | 0.75 |
| Barque | 20 | 7 | 1.8 | — |

## 3. Cas particulier : véhicule volant (montgolfière)

Non supporté par le socle : `medium: 'air'` demande de modifier `entities/Player.ts`
(altitude, pas de collision au sol) et `entities/movement.ts`. C'est une tâche moteur à part
entière : voir la tâche dédiée dans `docs/ROADMAP.md`.

## 4. Test

`__eirelens.debugUnlockAll()` dans la console → menu Véhicules (V / X) → monter → rouler
sur route, en pente, contre un mur, au bord de l'eau → descendre. Aucune erreur console.
