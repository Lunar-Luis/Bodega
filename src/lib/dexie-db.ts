import Dexie, { type Table } from 'dexie';
import type { Venta, Producto, Config, HistorialEntry } from '../types';

interface SyncQueueItem {
  id?: number;
  table: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: string;
  timestamp: number;
}

interface KeyValueEntry {
  key: string;
  value: string;
  updatedAt: number;
}

export class BodegaDB extends Dexie {
  keyvalue!: Table<KeyValueEntry, string>;
  productos!: Table<Producto, number>;
  ventas!: Table<Venta, string>;
  config!: Table<Config, string>;
  historial!: Table<HistorialEntry, number>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('BodegaOnlineDB_Dexie');

    this.version(3).stores({
      keyvalue: 'key, updatedAt',
      productos: 'id, nombre, activo',
      ventas: 'id, fecha',
      config: 'id',
      historial: '++id, fecha',
      sync_queue: '++id, table, recordId',
    });
  }
}

export const dexieDb = new BodegaDB();
