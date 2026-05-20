import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Config } from '../types';

const CONFIG_INICIAL: Config = { tasaDolar: 0, ultimaActualizacion: '' };

function fromDB(raw: any): Config {
  return {
    tasaDolar: raw.tasa_dolar ?? 0,
    ultimaActualizacion: raw.ultima_actualizacion ?? '',
  };
}

export function useConfig(): [Config, (tasa: number) => Promise<void>, boolean] {
  const { user } = useAuth();
  const [config, setConfig] = useState<Config>(CONFIG_INICIAL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    supabase
      .from('config')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setConfig(fromDB(data));
        }
        setLoaded(true);
      });

    const channel = supabase
      .channel('config-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'config',
        filter: 'user_id=eq.' + user.id,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setConfig(fromDB(payload.new));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const actualizarTasa = useCallback(async (tasa: number) => {
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('config').upsert({
      user_id: user.id,
      tasa_dolar: tasa,
      ultima_actualizacion: now,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    setConfig({ tasaDolar: tasa, ultimaActualizacion: now });
  }, [user]);

  return [config, actualizarTasa, loaded];
}
