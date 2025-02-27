import { WorkflowDocument, delay, type WorkflowNodeJSON } from '@flowgram.ai/free-layout-core';
import { WorkflowContentChangeType } from '@flowgram.ai/free-layout-core';
import { type FlowNodeEntity } from '@flowgram.ai/document';

import {
  type AddWorkflowNodeOperation,
  type ContentChangeTypeToOperation,
  FreeOperationType,
} from '../types';
import { FreeHistoryConfig } from '../free-history-config';

export const addNodeChange: ContentChangeTypeToOperation<AddWorkflowNodeOperation> = {
  type: WorkflowContentChangeType.ADD_NODE,
  toOperation: async (event, ctx) => {
    const config = ctx.get<FreeHistoryConfig>(FreeHistoryConfig);
    const document = ctx.get<WorkflowDocument>(WorkflowDocument);
    const node = event.entity as FlowNodeEntity;
    const parentID = node.parent?.id;
    /**
     * 由于document.toNodeJSON依赖表单里面的default的值初始化，故此处需要等表单的初始化完成
     * 比如dataset-node/index.ts中formatOnSubmit实现需要value被初始化
     */
    await delay(10);
    const json: WorkflowNodeJSON = await document.toNodeJSON(node);

    return {
      type: FreeOperationType.addNode,
      value: {
        node: json,
        parentID,
      },
      uri: config.getNodeURI(node.id),
    };
  },
};
