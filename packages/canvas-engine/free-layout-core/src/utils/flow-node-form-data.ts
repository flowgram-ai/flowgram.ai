import { FlowNodeFormData } from '@flowgram.ai/form-core';
import { FlowNodeEntity } from '@flowgram.ai/document';

import type { WorkflowNodeRegistry } from '../typings';

export function getFlowNodeFormData(node: FlowNodeEntity) {
  return node.getData(FlowNodeFormData) as FlowNodeFormData;
}

export function toFormJSON(node: FlowNodeEntity) {
  const formData = node.getData(FlowNodeFormData) as FlowNodeFormData;
  if (!formData || !(node.getNodeRegistry() as WorkflowNodeRegistry).formMeta) return undefined;
  return formData.toJSON();
}
