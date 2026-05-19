import { supabase } from './supabase';
import { dexieDb } from './dexie-db';
import type { Venta } from '../types';

let isSyncing = false;
let currentUserId: string | null = null;

export function setSyncUser(userId: string | null) {
  currentUserId = userId;
}

export function getSyncUser(): string | null {
  return currentUserId;
}

export async function pushKeyValue(key: string): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;
  let local;
  try {
    local = await dexieDb.keyvalue.get(key);
  } catch { return; }
  if (!local) return;

  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: currentUserId,
      key,
      value: JSON.parse(local.value),
      updated_at: new Date(local.updatedAt).toISOString(),
    },
    { onConflict: 'user_id, key' }
  );

  if (error) {
    console.error('Sync error (pushKeyValue):', error);
  }
}

export async function pullKeyValue(key: string): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;

  const { data, error } = await supabase
    .from('user_data')
    .select('value, updated_at')
    .eq('user_id', currentUserId)
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Sync error (pullKeyValue):', error);
    return;
  }

  if (!data) return;

  const remoteUpdated = new Date(data.updated_at).getTime();
  const local = await dexieDb.keyvalue.get(key);
  const localUpdated = local?.updatedAt ?? 0;

  if (remoteUpdated > localUpdated) {
    try {
      await dexieDb.keyvalue.put({
        key,
        value: JSON.stringify(data.value),
        updatedAt: remoteUpdated,
      });
    } catch {}
  }
}

export async function pushVentas(): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;

  let localVentas: Venta[];
  try {
    localVentas = await dexieDb.ventas.toArray();
  } catch { return; }
  const remoteIds = new Set<string>();

  const { data: remote, error } = await supabase
    .from('ventas')
    .select('id')
    .eq('user_id', currentUserId);

  if (error) {
    console.error('Sync error (pushVentas fetch):', error);
    return;
  }

  for (const r of remote ?? []) {
    remoteIds.add(r.id);
  }

  for (const v of localVentas) {
    if (!remoteIds.has(v.id)) {
      const { error: insertError } = await supabase.from('ventas').insert({
        user_id: currentUserId,
        id: v.id,
        fecha: v.fecha,
        items: v.items,
        total_usd: v.totalUSD,
        total_bs: v.totalBs,
        metodo_pago: v.metodoPago,
        referencia: v.referencia ?? null,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Sync error (pushVenta insert):', insertError);
      }
    }
  }
}

export async function pullVentas(): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;

  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('user_id', currentUserId);

  if (error) {
    console.error('Sync error (pullVentas):', error);
    return;
  }

  const localMap = new Map<string, Venta>();
  try {
    for (const v of await dexieDb.ventas.toArray()) {
      localMap.set(v.id, v);
    }
  } catch { return; }

  for (const r of data ?? []) {
    const local = localMap.get(r.id);
    const remoteUpdated = new Date(r.updated_at).getTime();
    const localUpdated = local ? new Date(local.fecha).getTime() : 0;

    if (!local || remoteUpdated > localUpdated) {
      try {
        await dexieDb.ventas.put({
          id: r.id,
          fecha: r.fecha,
          items: r.items as Venta['items'],
          totalUSD: r.total_usd,
          totalBs: r.total_bs,
          metodoPago: r.metodo_pago,
          referencia: r.referencia ?? undefined,
        });
      } catch (e) {
        // Ignore duplicate key errors
      }
    }
  }
}

export async function pushVenta(venta: Venta): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;

  const { error } = await supabase.from('ventas').insert({
    user_id: currentUserId,
    id: venta.id,
    fecha: venta.fecha,
    items: venta.items,
    total_usd: venta.totalUSD,
    total_bs: venta.totalBs,
    metodo_pago: venta.metodoPago,
    referencia: venta.referencia ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Sync error (pushVenta):', error);
  }
}

export async function fullSync(): Promise<void> {
  if (!currentUserId || !navigator.onLine) return;
  if (isSyncing) return;

  isSyncing = true;
  try {
    const keys = ['bodegaonline_productos', 'bodegaonline_config', 'bodegaonline_historial'];
    for (const key of keys) {
      await pushKeyValue(key);
      await pullKeyValue(key);
    }
    await pushVentas();
    await pullVentas();
  } finally {
    isSyncing = false;
  }
}

export function isSyncBusy(): boolean {
  return isSyncing;
}

export function setupSyncListener(): () => void {
  if (!currentUserId) return () => {};

  const channel = supabase
    .channel('schema-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${currentUserId}`,
      },
      async (payload) => {
        const key = payload.new && typeof payload.new === 'object' && 'key' in payload.new
          ? (payload.new as { key: string }).key
          : null;
        if (key) {
          await pullKeyValue(key);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ventas',
        filter: `user_id=eq.${currentUserId}`,
      },
      async () => {
        await pullVentas();
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
