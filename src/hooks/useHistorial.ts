import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ahoraVenezuela } from '../utils/calculos';

const MAX_HISTORIAL = 100;
const DIAS_HISTORIAL = 30;

export interface HistorialEntry {
  id?: number;
  fecha: string;
  accion: string;
}

export function useHistorial(): [HistorialEntry[], (accion: string) => Promise<void>, boolean] {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    supabase
      .from('historial')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
      .limit(MAX_HISTORIAL)
      .then(({ data, error }) => {
        if (!error && data) {
          setHistorial(data.map((r: any) => ({
            id: r.id,
            fecha: r.fecha,
            accion: r.accion,
          })));
        }
        setLoaded(true);
      });

    const channel = supabase
      .channel('historial-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'historial',
        filter: 'user_id=eq.' + user.id,
      }, (payload) => {
        const entry = payload.new as any;
        setHistorial((prev) => {
          const next = [{ id: entry.id, fecha: entry.fecha, accion: entry.accion }, ...prev];
          const corte = Date.now() - DIAS_HISTORIAL * 24 * 60 * 60 * 1000;
          return next.filter((h) => new Date(h.fecha).getTime() > corte).slice(0, MAX_HISTORIAL);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const agregarHistorial = useCallback(async (accion: string) => {
    if (!user) return;
    await supabase.from('historial').insert({
      user_id: user.id,
      fecha: ahoraVenezuela(),
      accion,
    });
  }, [user]);

  return [historial, agregarHistorial, loaded];
}
