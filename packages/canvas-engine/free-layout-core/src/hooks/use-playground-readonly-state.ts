import { useEffect } from 'react';

import { usePlayground, useRefresh } from '@flowgram.ai/core';
import { type Disposable } from '@flowgram.ai/utils';

/**
 * 获取 readonly 状态
 */
export function usePlaygroundReadonlyState(listenChange?: boolean): boolean {
  const playground = usePlayground();
  const refresh = useRefresh();
  useEffect(() => {
    let dispose: Disposable | undefined = undefined;
    if (listenChange) {
      dispose = playground.config.onReadonlyOrDisabledChange(() => refresh());
    }
    return () => dispose?.dispose();
  }, [listenChange]);
  return playground.config.readonly;
}
