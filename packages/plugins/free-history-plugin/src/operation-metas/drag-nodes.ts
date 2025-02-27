import { FlowNodeTransformData } from '@flowgram.ai/document';
import { type PluginContext, TransformData } from '@flowgram.ai/core';
import { WorkflowDocument } from '@flowgram.ai/free-layout-core';
import { type OperationMeta } from '@flowgram.ai/history';

import { type DragNodeOperationValue, FreeOperationType } from '../types';
import { baseOperationMeta } from './base';

export const dragNodesOperationMeta: OperationMeta<DragNodeOperationValue, PluginContext, void> = {
  ...baseOperationMeta,
  type: FreeOperationType.dragNodes,
  inverse: op => ({
    ...op,
    value: {
      ...op.value,
      value: op.value.oldValue,
      oldValue: op.value.value,
    },
  }),
  apply: (operation, ctx) => {
    operation.value.ids.forEach((id, index) => {
      const document = ctx.get<WorkflowDocument>(WorkflowDocument);
      const node = document.getNode(id);
      if (!node) {
        return;
      }

      const transform = node.getData(TransformData);
      const point = operation.value.value[index];
      transform.update({
        position: {
          x: point.x,
          y: point.y,
        },
      });
      // 嵌套情况下需将子节点 transform 设为 dirty
      if (node.collapsedChildren?.length > 0) {
        node.collapsedChildren.forEach(childNode => {
          const childNodeTransformData =
            childNode.getData<FlowNodeTransformData>(FlowNodeTransformData);
          childNodeTransformData.fireChange();
        });
      }
    });
  },
  shouldMerge: () => false,
};
