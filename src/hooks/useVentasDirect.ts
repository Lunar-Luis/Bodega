import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Venta, CarritoItem, Producto } from '../types';

function itemToCarrito(raw: any): CarritoItem {
  return { productoId: raw.producto_id, cantidad: raw.cantidad };
}

function ventaFromDB(raw: any, items: CarritoItem[], totalUSD: number, totalBs: number): Venta {
  return {
    id: raw.id,
    fecha: raw.fecha,
    items,
    totalUSD,
    totalBs,
    metodoPago: raw.metodo_pago,
    referencia: raw.referencia ?? undefined,
  };
}

export function useVentasDirect(): [Venta[], (venta: Venta, productos: Producto[]) => Promise<void>, boolean] {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loaded, setLoaded] = useState(false);

  const cargarVentas = useCallback(async () => {
    if (!user) return;
    setLoaded(false);
    const { data: vData, error: vError } = await supabase
      .from('ventas')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false });

    if (vError || !vData) {
      setLoaded(true);
      return;
    }

    const ids = vData.map((v: any) => v.id);
    const { data: iData } = await supabase
      .from('venta_items')
      .select('*')
      .in('venta_id', ids);

    const itemsByVenta = new Map<string, CarritoItem[]>();
    const totalUsdByVenta = new Map<string, number>();
    const totalBsByVenta = new Map<string, number>();
    for (const item of iData ?? []) {
      const list = itemsByVenta.get(item.venta_id);
      const ci = itemToCarrito(item);
      if (list) list.push(ci);
      else itemsByVenta.set(item.venta_id, [ci]);
      totalUsdByVenta.set(item.venta_id, (totalUsdByVenta.get(item.venta_id) ?? 0) + item.precio_usd * item.cantidad);
      totalBsByVenta.set(item.venta_id, (totalBsByVenta.get(item.venta_id) ?? 0) + item.precio_bs * item.cantidad);
    }

    setVentas(vData.map((v: any) => ventaFromDB(
      v,
      itemsByVenta.get(v.id) ?? [],
      totalUsdByVenta.get(v.id) ?? 0,
      totalBsByVenta.get(v.id) ?? 0,
    )));
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ventas-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ventas',
        filter: 'user_id=eq.' + user.id,
      }, async () => {
        await cargarVentas();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, cargarVentas]);

  const addVenta = useCallback(async (venta: Venta, productos: Producto[]) => {
    if (!user) return;

    const { error: vError } = await supabase.from('ventas').insert({
      id: venta.id,
      user_id: user.id,
      fecha: venta.fecha,
      metodo_pago: venta.metodoPago,
      referencia: venta.referencia ?? null,
    });

    if (vError) throw vError;

    const items = venta.items.map((item) => {
      const p = productos.find((pr) => pr.id === item.productoId);
      return {
        venta_id: venta.id,
        producto_id: item.productoId,
        cantidad: item.cantidad,
        precio_usd: p?.precioUSD ?? 0,
        precio_bs: p?.precioBs ?? 0,
      };
    });

    const { error: iError } = await supabase.from('venta_items').insert(items);
    if (iError) throw iError;

    setVentas((prev) => [venta, ...prev]);
  }, [user]);

  return [ventas, addVenta, loaded];
}
