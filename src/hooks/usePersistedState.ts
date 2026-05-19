import { useState, useEffect, useCallback, useRef } from 'react';
import { dbGetItem, dbSetItem } from '../utils/db';

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
        const val = await dbGetItem(key);
        if (val !== null) {
          setStoredValue(JSON.parse(val));
          setLoaded(true);
          return;
        }
      } catch {}

      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
          await dbSetItem(key, item).catch(() => {});
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
    dbSetItem(key, serialized).catch(console.error);
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
