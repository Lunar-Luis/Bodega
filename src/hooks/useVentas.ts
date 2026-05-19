import { useState, useEffect, useCallback } from 'react';
import { Venta } from '../types';
import { dexieDb } from '../lib/dexie-db';
import { pushVenta } from '../lib/sync';

export function useVentas(): [Venta[], (venta: Venta) => Promise<void>, boolean] {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dexieDb.ventas
      .toArray()
      .then((v) => {
        v.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setVentas(v);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addVenta = useCallback((venta: Venta) => {
    return dexieDb.ventas.add(venta).then(() => {
      setVentas((prev) => [venta, ...prev]);
      pushVenta(venta);
    });
  }, []);

  return [ventas, addVenta, loaded];
}
