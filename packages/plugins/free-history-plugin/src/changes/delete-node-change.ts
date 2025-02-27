import { WorkflowDocument, WorkflowContentChangeType, delay } from '@flowgram.ai/free-layout-core';
import { type FlowNodeEntity } from '@flowgram.ai/document';

import {
  type ContentChangeTypeToOperation,
  FreeOperationType,
  type DeleteWorkflowNodeOperation,
} from '../types';
import { FreeHistoryConfig } from '../free-history-config';

export const deleteNodeChange: ContentChangeTypeToOperation<DeleteWorkflowNodeOperation> = {
  type: WorkflowContentChangeType.DELETE_NODE,
  toOperation: async (event, ctx) => {
    const config = ctx.get<FreeHistoryConfig>(FreeHistoryConfig);
    const document = ctx.get<WorkflowDocument>(WorkflowDocument);
    const node = event.entity as FlowNodeEntity;
    const json = await document.toNodeJSON(node);
    const parentID = node.parent?.id;

    // 删除节点和删除连线同时触发，删除节点需放在后面执行
    await delay(0);

    return {
      type: FreeOperationType.deleteNode,
      value: {
        node: json,
        parentID,
      },
      uri: config.getNodeURI(node.id),
    };
  },
};
