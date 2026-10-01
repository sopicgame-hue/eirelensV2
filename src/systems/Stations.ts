/**
 * Stations — les gares (une par zone) et le voyage en train.
 *   - stationStamps() : aplanit le terrain sous chaque gare (avant la création du relief)
 *   - construit les 4 gares (toujours chargées : petits modèles), avec leurs obstacles
 *   - nearest() : gare la plus proche du joueur (pour proposer "Prendre le train")
 *   - arrival() : où le joueur apparaît en descendant du train
 * Les données (nom, coordonnées) sont dans world/data/zones.ts.
 */
import * as THREE from 'three';
import { ZONES, ZoneId } from '../world/data/zones';
import { lonLatToWorld } from '../world/geo';
import { Heightfield, TerrainStamp } from '../world/Heightfield';
import { Colliders } from '../world/Colliders';
import { STATIONS } from '../config/gameConfig';
import { buildStation, STATION_LAYOUT } from '../models/stationModel';
import { localToWorld } from './LandmarkManager';

interface PlacedStation {
  zone: ZoneId;
  name: string;
  x: number;
  z: number;
  rot: number;
}

function placements(): PlacedStation[] {
  return ZONES.map((zone) => {
    const p = lonLatToWorld(zone.station.lon, zone.station.lat);
    return { zone: zone.id, name: zone.station.name, x: p.x, z: p.z, rot: ((zone.station.rotationDeg ?? 0) * Math.PI) / 180 };
  });
}

/** Terrain plat sous les gares (à passer au Heightfield avec les tampons des monuments). */
export function stationStamps(): TerrainStamp[] {
  // rayon + blend < distance à la rivière/mer la plus proche (sinon l'eau serait comblée)
  return placements().map((s) => ({ kind: 'flatten', x: s.x, z: s.z, radius: 14, blend: 6 }));
}

export class Stations {
  readonly group = new THREE.Group();
  readonly list = placements();

  constructor(hf: Heightfield, colliders: Colliders) {
    this.group.name = 'stations';
    for (const s of this.list) {
      const obj = buildStation();
      obj.position.set(s.x, hf.heightAt(s.x, s.z), s.z);
      obj.rotation.y = s.rot;
      obj.name = `station:${s.zone}`;
      this.group.add(obj);
      for (const c of STATION_LAYOUT.colliders) {
        const w = localToWorld(s.x, s.z, s.rot, c.x, c.z);
        colliders.add(`station:${s.zone}`, { ...c, x: w.x, z: w.z, rot: c.rot + s.rot });
      }
    }
  }

  get(zone: ZoneId) {
    return this.list.find((s) => s.zone === zone)!;
  }

  /** Vrai si (x, z) est réservé à une gare (pas de maisons ni d'arbres). */
  isReserved(x: number, z: number) {
    const r = STATIONS.CLEAR_RADIUS;
    return this.list.some((s) => Math.abs(x - s.x) < r && Math.abs(z - s.z) < r && Math.hypot(x - s.x, z - s.z) < r);
  }

  private result = { station: null as unknown as PlacedStation, distance: Infinity };

  /** Gare la plus proche et sa distance. (Objet réutilisé à chaque appel : ne pas le conserver.) */
  nearest(x: number, z: number) {
    const r = this.result;
    r.station = this.list[0];
    r.distance = Infinity;
    for (const s of this.list) {
      const d = Math.hypot(x - s.x, z - s.z);
      if (d < r.distance) {
        r.distance = d;
        r.station = s;
      }
    }
    return r;
  }

  /** Point d'arrivée (monde) et orientation (face à la gare : la caméra, derrière, la montre). */
  arrival(zone: ZoneId) {
    const s = this.get(zone);
    const a = STATION_LAYOUT.arrival;
    const w = localToWorld(s.x, s.z, s.rot, a.x, a.z);
    return { x: w.x, z: w.z, heading: s.rot };
  }
}
