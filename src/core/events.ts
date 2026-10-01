/**
 * Bus d'événements typé. Permet aux systèmes de réagir les uns aux autres
 * SANS s'importer mutuellement (ex : l'audio et le mouton réagissent à une
 * photo sans que PhotoSystem les connaisse).
 *
 * Pour ajouter un événement : ajoute une entrée dans GameEvents, puis
 *   events.emit('monEvenement', {...})  /  events.on('monEvenement', cb)
 */

export interface GameEvents {
  photoTaken: { photoId: string; landmarkId: string | null; stars: number; withSheep: boolean; isNewLandmark: boolean };
  landmarkDiscovered: { landmarkId: string };
  vehicleUnlocked: { vehicleId: string };
  vehicleChanged: { vehicleId: string };
  sheepSays: { text: string; duration?: number };
  toast: { text: string; icon?: string };
  enterRegion: { name: string };
  screenChanged: { screen: string };
}

type Handler<T> = (payload: T) => void;

class EventBus {
  private handlers = new Map<keyof GameEvents, Set<Handler<any>>>();

  on<K extends keyof GameEvents>(name: K, cb: Handler<GameEvents[K]>): () => void {
    let set = this.handlers.get(name);
    if (!set) this.handlers.set(name, (set = new Set()));
    set.add(cb);
    return () => set!.delete(cb);
  }

  emit<K extends keyof GameEvents>(name: K, payload: GameEvents[K]) {
    this.handlers.get(name)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error(`[events] erreur dans un handler de "${name}"`, e);
      }
    });
  }

  clear() {
    this.handlers.clear();
  }
}

export const events = new EventBus();
