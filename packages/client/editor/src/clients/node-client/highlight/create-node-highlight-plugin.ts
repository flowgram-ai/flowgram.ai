import { definePluginCreator } from '@flowgram.ai/core';

import { createHighlightStyle, removeHighlightStyle } from './highlight-style';

export const createNodeHighlightPlugin = definePluginCreator<{}>({
  onInit() {
    createHighlightStyle();
  },
  onDispose() {
    removeHighlightStyle();
  },
});
