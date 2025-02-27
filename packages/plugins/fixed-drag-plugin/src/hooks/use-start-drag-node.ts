import { useMemo } from 'react';

import { FlowDragLayer } from '@flowgram.ai/renderer';
import { usePlayground } from '@flowgram.ai/core';

export function useStartDragNode() {
  const playground = usePlayground();

  const dragLayer = playground.getLayer(FlowDragLayer);

  return useMemo(
    () => ({
      startDrag: dragLayer ? dragLayer.startDrag.bind(dragLayer) : (e: any) => {},
    }),
    [dragLayer]
  );
}
