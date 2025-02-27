import { FlowNodeBaseType, type FlowNodeRegistry, FlowNodeSplitType } from '@flowgram.ai/document';

/**
 * 不能动态添加分支的分支节点
 * staticSplit:  (最原始的 id)
 *  blockIcon
 *  inlineBlocks
 *    block1
 *      blockOrderIcon
 *    block2
 *      blockOrderIcon
 */
export const StaticSplitRegistry: FlowNodeRegistry = {
  extend: FlowNodeSplitType.DYNAMIC_SPLIT,
  type: FlowNodeSplitType.STATIC_SPLIT,
  extendChildRegistries: [
    {
      type: FlowNodeBaseType.INLINE_BLOCKS,
      getLabels() {
        return [];
      },
    },
  ],
};
