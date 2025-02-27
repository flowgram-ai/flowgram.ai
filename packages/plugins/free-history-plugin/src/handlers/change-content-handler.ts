/* eslint-disable @typescript-eslint/naming-convention */
import { injectable, inject } from 'inversify';
import { type PluginContext } from '@flowgram.ai/core';
import { type WorkflowContentChangeEvent } from '@flowgram.ai/free-layout-core';
import { HistoryService } from '@flowgram.ai/history';

import { type IHandler } from '../types';
import changes from '../changes';

@injectable()
export class ChangeContentHandler implements IHandler<WorkflowContentChangeEvent> {
  @inject(HistoryService)
  private _historyService: HistoryService;

  async handle(event: WorkflowContentChangeEvent, ctx: PluginContext) {
    if (!this._historyService.undoRedoService.canPush()) {
      return;
    }

    const change = changes.find(c => c.type === event.type);
    if (!change) {
      return;
    }
    const operation = await change.toOperation(event, ctx);
    if (!operation) {
      return;
    }

    this._historyService.pushOperation(operation, { noApply: true });
  }
}
