import { useState, useEffect } from 'react';

export function useStorageQuota(): number {
  const [usado, setUsado] = useState(0);

  useEffect(() => {
    let cancel = false;
    const recalcular = () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(({ usage }) => {
          if (!cancel) setUsado(usage || 0);
        }).catch(() => {});
      }
    };
    recalcular();
    const interval = setInterval(recalcular, 5000);
    return () => { cancel = true; clearInterval(interval); };
  }, []);

  return usado;
}
