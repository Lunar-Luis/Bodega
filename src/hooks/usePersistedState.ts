import { useState, useEffect, useCallback, useRef } from 'react';
import { dexieDb } from '../lib/dexie-db';
import { pushKeyValue } from '../lib/sync';

export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const initialized = useRef(false);
  const primeraEscritura = useRef(true);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const entry = await dexieDb.keyvalue.get(key);
        if (entry) {
          setStoredValue(JSON.parse(entry.value));
          setLoaded(true);
          return;
        }
      } catch {}

      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
          await dexieDb.keyvalue.put({ key, value: item, updatedAt: Date.now() }).catch(() => {});
          localStorage.removeItem(key);
        }
      } catch {}
      setLoaded(true);
    })();
  }, [key]);

  useEffect(() => {
    if (primeraEscritura.current) {
      primeraEscritura.current = false;
      return;
    }
    const serialized = JSON.stringify(storedValue);
    dexieDb.keyvalue.put({ key, value: serialized, updatedAt: Date.now() }).catch(console.error);
    pushKeyValue(key);
  }, [key, storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        return value instanceof Function ? value(prev) : value;
      });
    },
    []
  );

  return [storedValue, setValue, loaded];
}
