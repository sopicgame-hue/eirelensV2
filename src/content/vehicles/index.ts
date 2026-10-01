/**
 * REGISTRE DES VÉHICULES. Ordre = ordre d'affichage dans le menu.
 * "À pied" n'est pas un véhicule : c'est l'état par défaut (id 'foot').
 */
import { VehicleDef } from './types';
import { bicycle } from './bicycle';
import { car } from './car';
import { currach } from './currach';

export const VEHICLES: VehicleDef[] = [bicycle, car, currach];

export const FOOT_ID = 'foot';

export function getVehicle(id: string): VehicleDef | undefined {
  return VEHICLES.find((v) => v.id === id);
}
