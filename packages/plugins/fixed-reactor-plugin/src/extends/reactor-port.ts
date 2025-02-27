import { mean } from 'lodash';
import {
  FlowNodeRegistry,
  FlowNodeBaseType,
  FlowTransitionLabelEnum,
  FlowTransitionLineEnum,
} from '@flowgram.ai/document';
import { FlowNodeTransformData } from '@flowgram.ai/document';

import { getPortChildInput, getReactorChildLineStartPoint } from '../utils/transition';
import { ReactorNodeType } from '../typings';
import { REACTOR_PORT_DISTANCE, RENDER_REACTOR_PORT_KEY } from '../constants';

export const reactorPort: FlowNodeRegistry = {
  type: ReactorNodeType.ReactorPort,
  extend: FlowNodeBaseType.BLOCK,
  meta: {
    inlineSpacingAfter: 0,
    inlineSpacingPre: 0,
    spacing: transform => {
      // 水平布局没有子节点情况
      if (!transform.entity.isVertical && transform.size.width === 0) {
        return 90;
      }
      return 30;
    },
    isInlineBlocks: node => !node.isVertical,
  },
  getLines(transition) {
    const icon = transition.transform.parent?.pre;
    const start = getReactorChildLineStartPoint(icon);
    const portPoint = transition.transform.inputPoint;

    return [
      {
        type: FlowTransitionLineEnum.ROUNDED_LINE,
        from: start,
        to: portPoint,
        vertices: [{ x: start.x, y: portPoint.y }],
        style: {
          strokeDasharray: '5 5',
        },
        radius: 5,
      },
      ...transition.transform.children.map(_child => {
        const childInput = getPortChildInput(_child);

        return {
          type: FlowTransitionLineEnum.ROUNDED_LINE,
          radius: 5,
          from: portPoint,
          to: childInput,
          vertices: [{ x: portPoint.x, y: childInput.y }],
          style: {
            strokeDasharray: '5 5',
          },
        };
      }),
    ];
  },
  getLabels(transition) {
    const portPoint = transition.transform.inputPoint;

    return [
      {
        type: FlowTransitionLabelEnum.CUSTOM_LABEL,
        renderKey: RENDER_REACTOR_PORT_KEY,
        props: {
          port: transition.entity,
        },
        offset: portPoint,
      },
    ];
  },
  getInputPoint(transform) {
    const icon = transform.parent?.pre;
    const start = getReactorChildLineStartPoint(icon);

    let inputY = transform.bounds.center.y;
    if (transform.children.length) {
      inputY = mean([
        getPortChildInput(transform.firstChild).y,
        getPortChildInput(transform.lastChild).y,
      ]);
    }

    return {
      x: start.x + REACTOR_PORT_DISTANCE,
      y: inputY,
    };
  },
  getChildDelta(child, layout) {
    const hasChild = !!child.firstChild;

    if (child.entity.isVertical) {
      // 绑定普通节点时进行重心纠偏
      let deltaX = hasChild ? 0 : -child.originDeltaX;

      return { x: deltaX, y: 0 };
    }

    let deltaY = hasChild ? 0 : -child.originDeltaY;

    const preTransform = child.entity.pre?.getData(FlowNodeTransformData);
    if (preTransform) {
      const { localBounds: preBounds } = preTransform;

      return {
        x: 0,
        y: preBounds.bottom + 30 + deltaY,
      };
    }

    return { x: 0, y: deltaY };
  },
  getChildLabels() {
    return [];
  },
  getChildLines() {
    return [];
  },
  getDelta(transform) {
    return {
      x: 0,
      y: 0,
    };
  },
};
