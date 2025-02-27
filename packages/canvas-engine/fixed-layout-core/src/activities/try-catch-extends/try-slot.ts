import { FlowNodeBaseType, type FlowNodeRegistry } from '@flowgram.ai/document';

import { TryCatchTypeEnum } from './constants';

/**
 * try 占位节点
 */
export const TrySlotRegistry: FlowNodeRegistry = {
  extend: FlowNodeBaseType.EMPTY,
  type: TryCatchTypeEnum.TRY_SLOT,
  // getLabels() {
  //   return []
  // },
};
