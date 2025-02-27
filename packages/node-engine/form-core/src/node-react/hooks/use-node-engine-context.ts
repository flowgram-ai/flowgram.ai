import { useEffect } from 'react';

import { useService, useRefresh } from '@flowgram.ai/core';

import { NodeEngineContext } from '../../node';

export function useNodeEngineContext(): NodeEngineContext {
  const refresh = useRefresh();
  const nodeEngineContext = useService<NodeEngineContext>(NodeEngineContext);

  useEffect(() => {
    const disposable = nodeEngineContext.onChange(() => {
      refresh();
    });

    return () => {
      disposable.dispose();
    };
  }, []);

  return nodeEngineContext;
}
