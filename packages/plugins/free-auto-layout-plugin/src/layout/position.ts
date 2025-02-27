import { FlowNodeTransformData } from '@flowgram.ai/document';
import { PositionSchema, startTween, TransformData } from '@flowgram.ai/core';

import { LayoutNode } from './type';
import { LayoutStore } from './store';

export class LayoutPosition {
  constructor(private readonly store: LayoutStore) {}

  public async position(): Promise<void> {
    return new Promise((resolve) => {
      startTween({
        from: { d: 0 },
        to: { d: 100 },
        duration: 300,
        onUpdate: (v) => {
          this.store.nodes.forEach((layoutNode) => {
            this.updateNodePosition({ layoutNode, step: v.d });
          });
        },
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private updateNodePosition(params: { layoutNode: LayoutNode; step: number }): void {
    const { layoutNode, step } = params;
    const transform = layoutNode.entity.getData(TransformData);
    const position: PositionSchema = {
      x: layoutNode.position.x + layoutNode.offset.x,
      y: layoutNode.position.y + layoutNode.offset.y,
    };
    const deltaX = ((position.x - transform.position.x) * step) / 100;
    const deltaY = ((position.y - transform.bounds.height / 2 - transform.position.y) * step) / 100;

    if (layoutNode.hasChildren) {
      // 嵌套情况下需将子节点 transform 设为 dirty
      layoutNode.entity.collapsedChildren.forEach((childNode) => {
        const childNodeTransformData =
          childNode.getData<FlowNodeTransformData>(FlowNodeTransformData);
        childNodeTransformData.fireChange();
      });
    }

    transform.update({
      position: {
        x: transform.position.x + deltaX,
        y: transform.position.y + deltaY,
      },
    });
  }
}
