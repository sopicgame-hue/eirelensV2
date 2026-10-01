/**
 * Calcule les informations du HUD (≈ 8 fois par seconde, pas à chaque frame) :
 * nom du lieu, boussole des monuments, indication contextuelle.
 */
import { uiStore } from '../ui/uiStore';
import { wrapAngle } from '../core/math';
import { LandmarkManager } from './LandmarkManager';
import { Towns } from '../world/Towns';
import { Progression } from './Progression';
import type { Player } from '../entities/Player';
import type { Sheep } from '../entities/Sheep';

const COMPASS_RANGE = 1200;

export function updateHud(opts: {
  player: Player;
  sheep: Sheep;
  camYaw: number;
  hour: number;
  landmarks: LandmarkManager;
  towns: Towns;
  progression: Progression;
  nearWaterForBoat: boolean;
}) {
  const { player, sheep, camYaw, landmarks, towns, progression } = opts;
  const px = player.pos.x;
  const pz = player.pos.z;

  // Lieu : monument proche > ville proche
  let region = '';
  let nearestLm = Infinity;
  for (const p of landmarks.placed) {
    const d = Math.hypot(p.x - px, p.z - pz);
    if (d < 140 && d < nearestLm) {
      nearestLm = d;
      region = p.def.name;
    }
  }
  if (!region) {
    const t = towns.nearest(px, pz);
    region = t.distance < t.town.radius + 10 ? t.town.name : t.distance < 400 ? `Environs de ${t.town.name}` : 'Campagne irlandaise';
  }

  // Boussole : monuments dans un rayon donné, angle relatif à la caméra
  const compass = [];
  for (const p of landmarks.placed) {
    const dx = p.x - px;
    const dz = p.z - pz;
    const d = Math.hypot(dx, dz);
    if (d > COMPASS_RANGE || d < 8) continue;
    compass.push({
      id: p.def.id,
      name: p.def.name,
      angle: wrapAngle(Math.atan2(dx, dz) - camYaw),
      distance: d,
      done: progression.stars(p.def.id) > 0,
    });
  }
  compass.sort((a, b) => a.distance - b.distance);

  // Indication contextuelle
  let hint = '';
  const dSheep = Math.hypot(sheep.pos.x - px, sheep.pos.z - pz);
  if (player.mode === 'foot' && dSheep < 3 && sheep.state === 'follow') hint = `pet`;
  else if (player.mode === 'foot' && opts.nearWaterForBoat) hint = 'boat';

  uiStore.patchHud({
    region,
    hour: opts.hour,
    vehicleId: player.mode === 'vehicle' && player.vehicle ? player.vehicle.id : player.mode === 'ride' ? 'sheep' : 'foot',
    compass: compass.slice(0, 6),
    discovered: progression.discovered,
    total: landmarks.placed.length,
    hint,
  });
}
