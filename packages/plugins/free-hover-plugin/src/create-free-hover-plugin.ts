import { definePluginCreator } from '@flowgram.ai/core';

import { HoverLayer } from './hover-layer';

export const createFreeHoverPlugin = definePluginCreator({
  onInit(ctx): void {
    ctx.playground.registerLayer(HoverLayer);
  },
});
