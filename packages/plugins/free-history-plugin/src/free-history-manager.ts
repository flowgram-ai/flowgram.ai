/* eslint-disable @typescript-eslint/naming-convention */
import { cloneDeep } from 'lodash';
import { injectable, inject } from 'inversify';
import { DisposableCollection } from '@flowgram.ai/utils';
import { HistoryService } from '@flowgram.ai/history';
import {
  WorkflowDocument,
  WorkflowResetLayoutService,
  WorkflowDragService,
} from '@flowgram.ai/free-layout-core';
import { FlowNodeFormData } from '@flowgram.ai/form-core';
import { FormManager } from '@flowgram.ai/form-core';
import { type PluginContext, PositionData } from '@flowgram.ai/core';

import { type FreeHistoryPluginOptions, FreeOperationType } from './types';
import { HistoryEntityManager } from './history-entity-manager';
import { DragNodesHandler } from './handlers/drag-nodes-handler';
import { ChangeNodeDataHandler } from './handlers/change-node-data-handler';
import { ChangeContentHandler } from './handlers/change-content-handler';

/**
 * 历史管理
 */
@injectable()
export class FreeHistoryManager {
  @inject(DragNodesHandler)
  private _dragNodesHandler: DragNodesHandler;

  @inject(ChangeNodeDataHandler)
  private _changeNodeDataHandler: ChangeNodeDataHandler;

  @inject(ChangeContentHandler)
  private _changeContentHandler: ChangeContentHandler;

  @inject(HistoryEntityManager)
  private _entityManager: HistoryEntityManager;

  @inject(FormManager)
  private _formManager: FormManager;

  private _toDispose: DisposableCollection = new DisposableCollection();

  onInit(ctx: PluginContext, opts: FreeHistoryPluginOptions) {
    const document = ctx.get<WorkflowDocument>(WorkflowDocument);
    const historyService = ctx.get<HistoryService>(HistoryService);
    const dragService = ctx.get<WorkflowDragService>(WorkflowDragService);

    const resetLayoutService = ctx.get<WorkflowResetLayoutService>(WorkflowResetLayoutService);

    if (opts?.limit) {
      historyService.limit(opts.limit);
    }
    historyService.context.source = ctx;

    this._toDispose.pushAll([
      dragService.onNodesDrag(async (event) => {
        if (event.type !== 'onDragEnd') {
          return;
        }
        this._dragNodesHandler.handle(event);
      }),
      document.onNodeCreate(({ node, data }) => {
        const positionData = node.getData(PositionData);
        if (positionData) {
          this._entityManager.addEntityData(positionData);
        }
      }),
      this._formManager.onFormModelWillInit(({ model, data }) => {
        const node = model.flowNodeEntity;
        const formData = node.getData<FlowNodeFormData>(FlowNodeFormData);

        if (formData) {
          this._entityManager.setValue(formData, cloneDeep(data));

          this._toDispose.push(
            formData.onDetailChange((event) => {
              this._changeNodeDataHandler.handle({
                ...event,
                node,
              });
            })
          );
        }
      }),
      document.onContentChange(async (event) => {
        await this._changeContentHandler.handle(event, ctx);
      }),
      document.onReload((_event) => {
        historyService.clear();
      }),
      resetLayoutService.onResetLayout((event) => {
        historyService.pushOperation(
          {
            type: FreeOperationType.resetLayout,
            value: {
              ids: event.nodeIds,
              value: event.positionMap,
              oldValue: event.oldPositionMap,
            },
          },
          { noApply: true }
        );
      }),
    ]);
  }

  dispose() {
    this._entityManager.dispose();
    this._toDispose.dispose();
  }
}
