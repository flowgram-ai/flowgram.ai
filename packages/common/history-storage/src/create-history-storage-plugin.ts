import { definePluginCreator } from '@flowgram.ai/core';

import { HistoryStoragePluginOptions } from './types';
import { HistoryStorageManager } from './history-storage-manager';
import { HistoryStorageContainerModule } from './history-storage-container-module';

export const createHistoryStoragePlugin = definePluginCreator<HistoryStoragePluginOptions>({
  onBind: ({ bind, rebind }) => {},
  onInit(ctx, opts): void {
    const historyStorageManager = ctx.get<HistoryStorageManager>(HistoryStorageManager);
    historyStorageManager.onInit(ctx, opts);
  },
  onDispose(ctx) {
    const historyStorageManager = ctx.get<HistoryStorageManager>(HistoryStorageManager);
    historyStorageManager.dispose();
  },
  containerModules: [HistoryStorageContainerModule],
});
