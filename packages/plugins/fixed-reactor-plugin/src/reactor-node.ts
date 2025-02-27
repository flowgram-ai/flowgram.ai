import { FlowNodeRegistry } from '@flowgram.ai/document';

import {
  drawStraightAdder,
  drawStraightLine,
  getInputPoint,
  getOutputPoint,
} from './utils/transition';
import { insideReactor } from './utils/node';
import { getAllPortsMiddle } from './utils/layout';
import { createReactorFromJSON } from './utils/create';
import { REACTOR_COLLAPSE_MARGIN, REACTOR_NODE_LAST_SPACING, REACTOR_SPACING } from './constants';

export const Reactor: FlowNodeRegistry = {
  type: 'reactor',
  extend: 'block',
  meta: {
    // Reactor 节点内部暂时不允许拖拽
    draggable: (node) => !insideReactor(node),
    hidden: true,
    spacing: REACTOR_SPACING,
    padding: (node) => ({
      left: 0,
      right: node.collapsed ? REACTOR_COLLAPSE_MARGIN : 0,
      bottom: !insideReactor(node.entity) && node.isLast ? REACTOR_NODE_LAST_SPACING : 0,
      top: 0,
    }),
    copyDisable: false,
    defaultExpanded: false,
    isReactor: true,
  },
  /**
   * 业务通常需要重载方法
   */
  onCreate: createReactorFromJSON,
  getLines: (transition) => [
    ...(!insideReactor(transition.entity) ? drawStraightLine(transition) : []),
  ],
  getLabels: (transition) => [
    ...(!insideReactor(transition.entity) ? drawStraightAdder(transition) : []),
  ],
  getInputPoint,
  getOutputPoint,
  onAfterUpdateLocalTransform(transform) {
    const { isVertical } = transform.entity;

    if (!isVertical) {
      return;
    }

    const icon = transform.firstChild;
    const inlineBlocks = transform.lastChild;

    if (!icon || !inlineBlocks) {
      return;
    }

    const iconSize = icon.localBounds.height;
    const inlineBlocksSize = inlineBlocks.localBounds.height;

    if (transform.collapsed || !inlineBlocks) {
      return;
    }

    // 所有 Ports 的中间点
    const portsMiddle = getAllPortsMiddle(inlineBlocks);

    icon.entity.clearMemoLocal();
    inlineBlocks.entity.clearMemoLocal();

    if (iconSize / 2 + portsMiddle > inlineBlocksSize || !inlineBlocks.children.length) {
      icon.transform.update({
        position: { x: icon.transform.position.x, y: 0 },
      });
      inlineBlocks.transform.update({
        position: {
          x: inlineBlocks.transform.position.x,
          y: Math.max(iconSize / 2 - inlineBlocksSize / 2, 0),
        },
      });

      return;
    }

    inlineBlocks.transform.update({
      position: { x: inlineBlocks.transform.position.x, y: 0 },
    });
    icon?.transform.update({
      position: {
        x: icon.transform.position.x,
        y: Math.max(portsMiddle - iconSize / 2, 0), // 所有 port 的中间点
      },
    });
  },
};
