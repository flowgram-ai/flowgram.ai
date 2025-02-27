import { FlowNodeRegistry, FlowNodeBaseType } from '@flowgram.ai/document';
import { FlowNodeTransformData } from '@flowgram.ai/document';

import { ReactorNodeType } from '../typings';
import {
  REACTOR_COLLAPSE_MARGIN,
  REACTOR_INLINE_BLOCKS_DELTA,
  REACTOR_PORT_DISTANCE,
} from '../constants';

export const reactorInlineBlocks: FlowNodeRegistry = {
  type: ReactorNodeType.ReactorInlineBlocks,
  extend: FlowNodeBaseType.BLOCK,
  meta: {
    spacing: 0,
    inlineSpacingPre: 0,
    inlineSpacingAfter: 0,
    isInlineBlocks: node => !node.isVertical,
  },
  getLines() {
    return [];
  },
  getLabels() {
    return [];
  },
  getChildDelta(child, layout) {
    if (child.entity.isVertical) {
      return { x: 0, y: 0 };
    }
    const preTransform = child.entity.pre?.getData(FlowNodeTransformData);
    if (preTransform) {
      const { localBounds: preBounds } = preTransform;

      return {
        x: 0,
        y: preBounds.bottom + 30,
      };
    }

    return { x: 0, y: 0 };
  },
  /**
   * 控制条件分支居右布局
   */
  getDelta(transform) {
    if (!transform.children.length) {
      return { x: 0, y: 0 };
    }

    const icon = transform.pre;
    if (!icon) {
      return { x: 0, y: 0 };
    }

    if (!transform.entity.isVertical) {
      const noChildren = transform?.children?.every?.(_port => !_port.children.length);
      /**
       * 如果没有 children 的时候，不需要有右侧的间距，避免水平布局的时候 reactor 右侧空间过大。
       */
      if (noChildren) {
        return {
          x: REACTOR_PORT_DISTANCE - icon.localBounds.width / 2,
          y: icon.localBounds.bottom + REACTOR_COLLAPSE_MARGIN,
        };
      }
      return {
        x: 2 * REACTOR_PORT_DISTANCE - icon.localBounds.width / 2,
        y: icon.localBounds.bottom + REACTOR_COLLAPSE_MARGIN,
      };
    }

    return {
      x: icon.localBounds.right + REACTOR_INLINE_BLOCKS_DELTA,
      y: -icon.localBounds.height,
    };
  },
};
