import { useMemo } from 'react';

import { ReactiveState } from '../core/reactive-state';
import { useObserve } from './use-observe';

export function useReactiveState<T extends Record<string, any>>(v: ReactiveState<T> | T): T {
  const state = useMemo<ReactiveState<T>>(
    () => (v instanceof ReactiveState ? v : new ReactiveState(v)),
    [],
  );
  return useObserve<T>(state.value);
}
