/* eslint-disable @typescript-eslint/naming-convention */
import { injectable, inject } from 'inversify';
import { TransformData } from '@flowgram.ai/core';
import { type NodesDragEndEvent } from '@flowgram.ai/free-layout-core';
import { HistoryService } from '@flowgram.ai/history';

import { FreeOperationType, type IHandler } from '../types';

@injectable()
export class DragNodesHandler implements IHandler<NodesDragEndEvent> {
  @inject(HistoryService)
  private _historyService: HistoryService;

  handle(event: NodesDragEndEvent) {
    if (
      event.type === 'onDragEnd' &&
      !event.altKey // altKey代表创建，这个通过add-node监听处理
    ) {
      this._dragNode(event);
    }
  }

  private _dragNode(event: NodesDragEndEvent) {
    this._historyService.pushOperation(
      {
        type: FreeOperationType.dragNodes,
        value: {
          ids: event.nodes.map(node => node.id),
          value: event.nodes.map(node => {
            const { x, y } = node.getData(TransformData).position;
            return {
              x,
              y,
            };
          }),
          oldValue: event.startPositions,
        },
      },
      { noApply: true },
    );
  }
}
