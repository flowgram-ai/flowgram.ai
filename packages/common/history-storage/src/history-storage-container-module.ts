import { ContainerModule } from 'inversify';

import { HistoryStorageManager } from './history-storage-manager';

export const HistoryStorageContainerModule = new ContainerModule(bind => {
  bind(HistoryStorageManager).toSelf().inSingletonScope();
});
