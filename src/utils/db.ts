import { Venta } from '../types';

const DB_NAME = 'BodegaOnlineDB';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains('keyvalue')) {
        db.createObjectStore('keyvalue', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('productos')) {
        db.createObjectStore('productos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ventas')) {
        const ventasStore = db.createObjectStore('ventas', { keyPath: 'id' });
        ventasStore.createIndex('fecha', 'fecha', { unique: false });
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('historial')) {
        db.createObjectStore('historial', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      dbInstance = req.result;
      dbInstance.onclose = () => { dbInstance = null; dbPromise = null; };
      dbInstance.onversionchange = () => { dbInstance?.close(); dbInstance = null; dbPromise = null; };
      resolve(dbInstance);
    };
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
  return dbPromise;
}

export function dbGetItem(key: string): Promise<string | null> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('keyvalue', 'readonly');
      const store = tx.objectStore('keyvalue');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  });
}

export function dbSetItem(key: string, value: string): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('keyvalue', 'readwrite');
      const store = tx.objectStore('keyvalue');
      store.put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export function dbRemoveItem(key: string): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('keyvalue', 'readwrite');
      const store = tx.objectStore('keyvalue');
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export function dbClear(): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('keyvalue', 'readwrite');
      const store = tx.objectStore('keyvalue');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export function dbAddVenta(venta: Venta): Promise<void> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('ventas', 'readwrite');
      const store = tx.objectStore('ventas');
      store.add(venta);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export function dbGetAllVentas(): Promise<Venta[]> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('ventas', 'readonly');
      const store = tx.objectStore('ventas');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}
