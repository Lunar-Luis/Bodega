import { useState, useEffect, useCallback, useRef } from 'react';
import { dbGetItem, dbSetItem } from '../utils/db';

export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const initialized = useRef(false);

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
        }
      } catch {}
      setLoaded(true);
    })();
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        const serialized = JSON.stringify(nextValue);
        dbSetItem(key, serialized).catch(console.error);
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue, loaded];
}