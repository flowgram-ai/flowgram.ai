import type { WorkflowNodeEntity } from '../entities';

/**
 * 子画布配置
 */
export type WorkflowSubCanvas = {
  isCanvas: boolean; // 是否画布节点
  parentNode: WorkflowNodeEntity; // 父节点
  canvasNode: WorkflowNodeEntity; // 画布节点
};
