import { definePluginCreator } from '@flowgram.ai/core';

import { StackingContextManager } from './manager';
import { StackingComputeMode } from './constant';

export const createFreeStackPlugin = definePluginCreator<{
  mode?: StackingComputeMode;
}>({
  onBind({ bind }) {
    bind(StackingContextManager).toSelf().inSingletonScope();
  },
  onInit(ctx, opts) {
    const stackingContextManager = ctx.get<StackingContextManager>(StackingContextManager);
    stackingContextManager.init(opts?.mode);
  },
  onReady(ctx) {
    const stackingContextManager = ctx.get<StackingContextManager>(StackingContextManager);
    stackingContextManager.ready();
  },
  onDispose(ctx) {
    const stackingContextManager = ctx.get<StackingContextManager>(StackingContextManager);
    stackingContextManager.dispose();
  },
});
