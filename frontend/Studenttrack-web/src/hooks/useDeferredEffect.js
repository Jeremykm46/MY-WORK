import { useEffect } from 'react';

export function useDeferredEffect(callback, deps) {
  useEffect(() => {
    const id = setTimeout(callback, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
