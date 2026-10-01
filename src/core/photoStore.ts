/**
 * Stockage des photos (images JPEG en dataURL) dans IndexedDB.
 * localStorage est limité à ~5 Mo : il ne doit JAMAIS contenir d'images.
 * Toutes les fonctions sont tolérantes aux pannes (navigation privée, quota) :
 * en cas d'échec on garde les photos en mémoire pour la session.
 */

export interface PhotoRecord {
  id: string;
  dataUrl: string;
  date: number;
  /** Heure de jeu (0-24) au moment de la photo. */
  hour: number;
  landmarkId: string | null;
  stars: number;
  withSheep: boolean;
  title: string;
}

const DB_NAME = 'eirelens';
const STORE = 'photos';
const memory = new Map<string, PhotoRecord>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function savePhoto(p: PhotoRecord) {
  const db = await openDb();
  if (!db) {
    memory.set(p.id, p); // repli en mémoire seulement si IndexedDB est indisponible
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(p);
    tx.oncomplete = () => resolve();
    tx.onerror = () => {
      memory.set(p.id, p); // quota dépassé… : on garde au moins la photo pour la session
      resolve();
    };
  });
}

export async function listPhotos(): Promise<PhotoRecord[]> {
  const db = await openDb();
  if (!db) return [...memory.values()].sort((a, b) => b.date - a.date);
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const all = req.result as PhotoRecord[];
      for (const p of memory.values()) if (!all.find((a) => a.id === p.id)) all.push(p);
      resolve(all.sort((a, b) => b.date - a.date));
    };
    req.onerror = () => resolve([...memory.values()]);
  });
}

export async function deletePhoto(id: string) {
  memory.delete(id);
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export async function clearPhotos() {
  memory.clear();
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
