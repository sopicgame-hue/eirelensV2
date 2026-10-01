/**
 * REGISTRE DES VÉHICULES. Ordre = ordre d'affichage dans le menu (garage).
 * "À pied" n'est pas un véhicule : c'est l'état par défaut (id 'foot').
 * Les véhicules s'ACHÈTENT avec les pièces gagnées en photographiant (champ `price`).
 */
import { VehicleDef } from './types';
import { bicycle } from './bicycle';
import { horse } from './horse';
import { currach } from './currach';
import { ulm } from './ulm';

export const VEHICLES: VehicleDef[] = [bicycle, horse, currach, ulm];

export const FOOT_ID = 'foot';

export function getVehicle(id: string): VehicleDef | undefined {
  return VEHICLES.find((v) => v.id === id);
}
