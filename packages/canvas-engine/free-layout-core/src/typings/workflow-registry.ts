import type { FormMeta } from '@flowgram.ai/node';
import type { FormMetaOrFormMetaGenerator } from '@flowgram.ai/form-core';
import type { FlowNodeRegistry } from '@flowgram.ai/document';

import type { WorkflowNodeEntity } from '../entities';
import type { WorkflowNodeMeta } from './workflow-node';

/**
 * 节点表单引擎配置
 */
export type WorkflowNodeFormMeta = FormMetaOrFormMetaGenerator | FormMeta;

/**
 * 节点注册
 */
export interface WorkflowNodeRegistry extends FlowNodeRegistry<WorkflowNodeMeta> {
  formMeta?: WorkflowNodeFormMeta;
}

export interface WorkflowNodeRenderProps {
  node: WorkflowNodeEntity;
}
