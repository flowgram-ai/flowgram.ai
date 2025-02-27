import { definePluginCreator, PluginContext } from '@flowgram.ai/core';

import { Operation, OperationService } from './operation';
import { HistoryContainerModule } from './history-container-module';

export interface HistoryPluginOptions<T = PluginContext> {
  enable?: boolean;
  onApply?: (ctx: T, operation: Operation) => void;
}

export const createHistoryPlugin = definePluginCreator<HistoryPluginOptions>({
  onInit: (ctx, opts) => {
    if (opts.onApply) {
      ctx.get(OperationService).onApply(opts.onApply.bind(null, ctx));
    }
  },
  containerModules: [HistoryContainerModule],
});
