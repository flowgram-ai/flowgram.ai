import { injectable } from 'inversify';
import {
  FlowLayout,
  FlowLayoutContribution,
  FlowNodeTransformData,
} from '@flowgram.ai/document';
import { FlowLayoutDefault } from '@flowgram.ai/document';

import { insideReactor, isReactor } from '../utils/node';
import { ReactorNodeType } from '../typings';

interface ShrinkData {
  // 收缩到哪个 Reactor 节点的底部空间
  reactor: FlowNodeTransformData;
  // Reactor 节点 Icon 右侧的坐标
  iconEdge: number;
  // Reactor 节点整个 Block 的底部坐标
  blockEnd: number;
}

/**
 * Reactor 后续节点紧凑化布局
 */
@injectable()
export class ReactorShrinkLayout implements FlowLayoutContribution {
  // 节点是否被缩进过
  shrinkDataMap = new WeakMap<FlowNodeTransformData, ShrinkData>();

  onAfterUpdateLocalTransform(transform: FlowNodeTransformData, layout: FlowLayout): void {
    // 在 Reactor 内部不运行 Shrink 算法
    if (
      insideReactor(transform.entity) ||
      transform.entity.flowNodeType === ReactorNodeType.ReactorPort ||
      isReactor(transform.parent?.entity)
    ) {
      return;
    }

    if (FlowLayoutDefault.isVertical(layout)) {
      // 垂直布局实现
      this.layoutReactorShrinkVertical(transform);
      return;
    }

    // 水平布局实现
    this.layoutReactorShrinkInHorizontal(transform);
  }

  // 垂直布局实现
  layoutReactorShrinkVertical(transform: FlowNodeTransformData) {
    /**
     * 1. Reactor 节点向上填充空白区域
     */
    if (isReactor(transform?.entity)) {
      const icon = transform.firstChild;
      const iconRight = icon?.localBounds.right || 0;

      const reactorTop = transform?.localBounds.top || 0;
      const topEmptySpace = icon?.localBounds.top || 0;

      // Reactor 偏移不会超过该边界
      let edgeY = reactorTop;

      // 向上一直找到 Block 的右侧大于 icon 的右侧区域
      let curr = transform.pre;
      while (curr && curr.localBounds.right <= iconRight) {
        edgeY = curr.localBounds.top;
        curr = curr.pre;
      }

      const reactorDelta = Math.min(reactorTop - edgeY, topEmptySpace);

      transform.transform.update({
        position: {
          x: transform.transform.position.x,
          y: transform.transform.position.y - reactorDelta,
        },
      });

      transform.entity.clearMemoLocal();
      return;
    }

    const pre = transform.pre;

    if (!pre) {
      this.shrinkDataMap.delete(transform);
      return;
    }

    /**
     * 2. Reactor 节点后续节点向上填充空白
     */
    if (isReactor(pre?.entity)) {
      const pre = transform.pre;
      const icon = pre.firstChild;
      const iconRight = icon?.localBounds.right || 0;
      const y = (pre.localBounds?.top || 0) + (icon?.localBounds.bottom || 0) + (pre.spacing || 0);

      if (transform.localBounds?.right > iconRight) {
        this.shrinkDataMap.delete(transform);
        // 空间不够，不进行收缩操作
        return;
      }

      transform.transform.update({
        position: {
          x: transform.transform.position.x,
          y,
        },
      });

      this.shrinkDataMap.set(transform, {
        reactor: pre!,
        iconEdge: iconRight,
        blockEnd: pre?.localBounds.bottom! + (pre.spacing || 0),
      });

      transform.entity.clearMemoLocal();

      return;
    }

    /**
     * 3. 前序节点被 shrink 到 reactor 内部时，且当前节点依旧在 Reactor shrink 的范围内
     */
    const preShrinkData = this.shrinkDataMap.get(pre);
    if (preShrinkData && transform.localBounds.top <= preShrinkData.blockEnd) {
      if (transform.localBounds.right > preShrinkData.iconEdge) {
        // 空间不够，移到 shrink 范围外
        transform.transform.update({
          position: {
            x: transform.transform.position.x,
            y: preShrinkData.blockEnd,
          },
        });
        transform.entity.clearMemoLocal();
        this.shrinkDataMap.delete(transform);
      } else {
        // 当前节点依旧在 shrink 范围内
        this.shrinkDataMap.set(transform, preShrinkData);
      }
      return;
    }

    // 不在 shrink 范围内的节点删除 shrink 数据
    this.shrinkDataMap.delete(transform);

    return;
  }

  // 水平布局实现
  layoutReactorShrinkInHorizontal(transform: FlowNodeTransformData) {
    const pre = transform.pre;

    if (!pre) {
      this.shrinkDataMap.delete(transform);
      return;
    }

    /**
     * 1. Reactor 节点后续节点填充空白
     */
    if (isReactor(pre?.entity)) {
      const pre = transform.pre;
      const icon = pre.firstChild;
      const iconBottom = icon?.localBounds.bottom || 0;
      const x = (pre.localBounds?.left || 0) + (icon?.localBounds.right || 0) + (pre.spacing || 0);

      if (transform.localBounds?.bottom > iconBottom) {
        this.shrinkDataMap.delete(transform);
        // 空间不够，不进行收缩操作
        return;
      }

      transform.transform.update({
        position: {
          x: x,
          y: transform.transform.position.y,
        },
      });

      this.shrinkDataMap.set(transform, {
        reactor: pre!,
        iconEdge: iconBottom,
        blockEnd: pre?.localBounds.right! + (pre.spacing || 0),
      });

      transform.entity.clearMemoLocal();

      return;
    }

    /**
     * 2. 前序节点被 shrink 到 reactor 内部时，且当前节点依旧在 Reactor shrink 的范围内
     */
    const preShrinkData = this.shrinkDataMap.get(pre);
    if (preShrinkData && transform.localBounds.left <= preShrinkData.blockEnd) {
      if (transform.localBounds.bottom > preShrinkData.iconEdge) {
        // 空间不够，移到 shrink 范围外
        transform.transform.update({
          position: {
            x: preShrinkData.blockEnd,
            y: transform.transform.position.y,
          },
        });
        transform.entity.clearMemoLocal();
        this.shrinkDataMap.delete(transform);
      } else {
        // 当前节点依旧在 shrink 范围内
        this.shrinkDataMap.set(transform, preShrinkData);
      }
      return;
    }

    // 不在 shrink 范围内的节点删除 shrink 数据
    this.shrinkDataMap.delete(transform);

    return;
  }
}
