import React, { useMemo } from 'react';

import { usePlayground } from '@flowgram.ai/core';

import {
  PlaygroundContentLayer,
  PlaygroundReactContentProps,
} from '../layers/playground-content-layer';

export { PlaygroundReactContentProps };

export const PlaygroundReactContent: React.FC<PlaygroundReactContentProps> = props => {
  const playground = usePlayground();
  useMemo(() => {
    const layer = playground.getLayer(PlaygroundContentLayer)!;
    layer.updateOptions(props);
  }, [props]);
  return <></>;
};
