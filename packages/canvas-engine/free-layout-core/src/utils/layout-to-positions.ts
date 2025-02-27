import { FlowNodeTransformData, type FlowNodeEntity } from '@flowgram.ai/document';
import { TransformData, startTween } from '@flowgram.ai/core';
import { type IPoint } from '@flowgram.ai/utils';

/**
 * Coze 中节点坐标，以卡片顶部中间为原点。
 * autoLayout 计算出来的对齐的坐标以节点正中为原点，需要上移当前节点一般高度。
 * 即： newPosition.y - transform.bounds.height / 2
 * bounds 的原点坐标为左上角。
 */
export const layoutToPositions = async (
  nodes: FlowNodeEntity[],
  nodePositionMap: Record<string, IPoint>,
): Promise<Record<string, IPoint>> => {
  // 缓存上次位置，用来还原位置
  const newNodePositionMap: Record<string, IPoint> = {};
  nodes.forEach(node => {
    const transform = node.getData(TransformData);
    const nodeTransform = node.getData(FlowNodeTransformData);

    newNodePositionMap[node.id] = {
      x: transform.position.x,
      y: transform.position.y + nodeTransform.bounds.height / 2,
    };
  });

  return new Promise(resolve => {
    startTween({
      from: { d: 0 },
      to: { d: 100 },
      duration: 300,
      onUpdate: v => {
        nodes.forEach(node => {
          const transform = node.getData(TransformData);
          const deltaX = ((nodePositionMap[node.id].x - transform.position.x) * v.d) / 100;
          const deltaY =
            ((nodePositionMap[node.id].y - transform.bounds.height / 2 - transform.position.y) *
              v.d) /
            100;

          if (node.collapsedChildren?.length > 0) {
            // 嵌套情况下需将子节点 transform 设为 dirty
            node.collapsedChildren.forEach(childNode => {
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
        });
      },
      onComplete: () => {
        resolve(newNodePositionMap);
      },
    });
  });
};
