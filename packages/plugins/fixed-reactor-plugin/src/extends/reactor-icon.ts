import { FlowNodeRegistry, FlowNodeBaseType } from '@flowgram.ai/document';

import { drawCollapseLabel, drawCollapseLine } from '../utils/transition';
import { canReactorDrilldown, insideReactor } from '../utils/node';

export const reactorIcon: FlowNodeRegistry = {
  type: FlowNodeBaseType.BLOCK_ICON,
  meta: {
    defaultExpanded: false,
    spacing: 0,
  },
  getLines: transition => [
    ...(canReactorDrilldown(transition.entity.parent!) ? drawCollapseLine(transition) : []),
  ],
  getLabels: transition => [
    ...(canReactorDrilldown(transition.entity.parent!) ? drawCollapseLabel(transition) : []),
  ],
  getDelta: transform => {
    // Reactor 节点内部时，重新纠正重心调整产生的偏移
    if (insideReactor(transform.entity.parent)) {
      return transform.entity.isVertical
        ? { x: -transform.originDeltaX, y: 0 }
        : { x: 0, y: -transform.originDeltaY };
    }
    return { x: 0, y: 0 };
  },
};
