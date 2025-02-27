import { DEFAULT_SPACING, FlowNodeBaseType, type FlowNodeRegistry } from '@flowgram.ai/document';

/**
 * 根节点
 */
export const RootRegistry: FlowNodeRegistry = {
  type: FlowNodeBaseType.ROOT,
  meta: {
    spacing: DEFAULT_SPACING.NULL,
    hidden: true,
  },
  getInputPoint(transform) {
    return transform.firstChild?.inputPoint || transform.bounds.topCenter;
  },
  getOutputPoint(transform) {
    return transform.firstChild?.outputPoint || transform.bounds.bottomCenter;
  },
};
