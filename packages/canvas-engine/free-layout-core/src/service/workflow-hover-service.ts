import { inject, injectable } from 'inversify';
import { EntityManager } from '@flowgram.ai/core';
import { Emitter, type IPoint } from '@flowgram.ai/utils';

import {
  type WorkflowLineEntity,
  type WorkflowNodeEntity,
  type WorkflowPortEntity,
} from '../entities';

/**
 * 可 Hover 的节点 类型
 */
export type WorkfloEntityHoverable = WorkflowNodeEntity | WorkflowLineEntity | WorkflowPortEntity;
/**
 * hover 状态管理
 */
@injectable()
export class WorkflowHoverService {
  @inject(EntityManager) protected entityManager: EntityManager;

  protected onHoveredChangeEmitter = new Emitter<string>();

  readonly onHoveredChange = this.onHoveredChangeEmitter.event;

  // 当前鼠标 hover 位置
  hoveredPos: IPoint = { x: 0, y: 0 };

  /**
   * 当前 hovered 的 节点或者线条或者点
   * 1: nodeId / lineId  （节点 / 线条）
   * 2: nodeId:portKey  （节点连接点）
   */
  hoveredKey = '';

  /**
   * 更新 hover 的内容
   * @param hoveredKey hovered key
   */
  updateHoveredKey(hoveredKey: string): void {
    if (this.hoveredKey !== hoveredKey) {
      this.hoveredKey = hoveredKey;
      this.onHoveredChangeEmitter.fire(hoveredKey);
    }
  }

  /**
   * 清空 hover 内容
   */
  clearHovered(): void {
    this.updateHoveredKey('');
  }

  /**
   *  判断是否 hover
   * @param nodeId hoveredKey
   * @returns 是否 hover
   */
  isHovered(nodeId: string): boolean {
    return nodeId === this.hoveredKey;
  }

  isSomeHovered(): boolean {
    return !!this.hoveredKey;
  }

  /**
   * 获取被 hover 的节点或线条
   */
  get hoveredNode(): WorkfloEntityHoverable | undefined {
    return this.entityManager.getEntityById(this.hoveredKey);
  }
}
