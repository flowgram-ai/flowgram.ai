import { definePluginCreator } from '@flowgram.ai/core';

import { BackgroundLayer, BackgroundLayerOptions } from './background-layer';

/**
 * 点位背景插件
 */
export const createBackgroundPlugin = definePluginCreator<BackgroundLayerOptions>({
  onInit: (ctx, opts) => {
    ctx.playground.registerLayer(BackgroundLayer, opts);
  },
});
