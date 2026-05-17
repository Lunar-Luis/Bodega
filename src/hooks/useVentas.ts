import { useState, useEffect, useCallback } from 'react';
import { Venta } from '../types';
import { dbGetAllVentas, dbAddVenta } from '../utils/db';

export function useVentas(): [Venta[], (venta: Venta) => void, boolean] {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dbGetAllVentas().then((v) => {
      v.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setVentas(v);
      setLoaded(true);
    });
  }, []);

  const addVenta = useCallback((venta: Venta) => {
    dbAddVenta(venta).then(() => {
      setVentas((prev) => [venta, ...prev]);
    });
  }, []);

  return [ventas, addVenta, loaded];
}
