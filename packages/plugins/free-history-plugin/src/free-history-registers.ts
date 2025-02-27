import { injectable } from 'inversify';
import { type OperationContribution, type OperationRegistry } from '@flowgram.ai/history';

import { operationMetas } from './operation-metas';

@injectable()
export class FreeHistoryRegisters implements OperationContribution {
  registerOperationMeta(operationRegistry: OperationRegistry): void {
    operationMetas.forEach(operationMeta => {
      operationRegistry.registerOperationMeta(operationMeta);
    });
  }
}
