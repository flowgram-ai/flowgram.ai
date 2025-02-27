import { useCallback, useState } from 'react';

export function useRefresh(defaultValue?: any): (v?: any) => void {
  const [, update] = useState<any>(defaultValue);
  return useCallback((v?: any) => update(v !== undefined ? v : {}), []);
}
