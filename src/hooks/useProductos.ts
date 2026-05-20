import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Producto } from '../types';

function fromDB(raw: any): Producto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    precioUSD: raw.precio_usd,
    precioBs: raw.precio_bs,
    imagen: raw.imagen ?? undefined,
    activo: raw.activo,
  };
}

function toDB(p: Producto, userId: string): any {
  return {
    user_id: userId,
    nombre: p.nombre,
    precio_usd: p.precioUSD,
    precio_bs: p.precioBs,
    imagen: p.imagen ?? null,
    activo: p.activo,
  };
}

export function useProductos(): [Producto[], (p: Producto) => Promise<void>, (p: Producto) => Promise<void>, (id: number) => Promise<void>, boolean] {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    supabase
      .from('productos')
      .select('*')
      .eq('user_id', user.id)
      .order('id')
      .then(({ data, error }) => {
        if (!error && data) {
          setProductos(data.map(fromDB));
        }
        setLoaded(true);
      });

    const channel = supabase
      .channel('productos-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'productos',
        filter: 'user_id=eq.' + user.id,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProductos((prev) => {
            if (prev.some((p) => p.id === (payload.new as any).id)) return prev;
            return [...prev, fromDB(payload.new)];
          });
        } else if (payload.eventType === 'UPDATE') {
          setProductos((prev) => prev.map((p) => p.id === (payload.new as any).id ? fromDB(payload.new) : p));
        } else if (payload.eventType === 'DELETE') {
          setProductos((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const agregarProducto = useCallback(async (producto: Producto) => {
    if (!user) return;
    const { data, error } = await supabase.from('productos').insert(toDB(producto, user.id)).select().single();
    if (error) throw error;
    if (data) {
      setProductos((prev) => [...prev, fromDB(data)]);
    }
  }, [user]);

  const actualizarProducto = useCallback(async (producto: Producto) => {
    if (!user) return;
    const { data, error } = await supabase.from('productos').update(toDB(producto, user.id)).eq('id', producto.id).eq('user_id', user.id).select().single();
    if (error) throw error;
    if (data) {
      setProductos((prev) => prev.map((p) => p.id === data.id ? fromDB(data) : p));
    }
  }, [user]);

  const eliminarProducto = useCallback(async (id: number) => {
    if (!user) return;
    const { error } = await supabase.from('productos').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, [user]);

  return [productos, agregarProducto, actualizarProducto, eliminarProducto, loaded];
}
