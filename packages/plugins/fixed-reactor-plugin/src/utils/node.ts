import { FlowNodeEntity } from '@flowgram.ai/document';
import { FlowNodeTransformData } from '@flowgram.ai/document';

import { ReactorNodeType } from '../typings';

/**
 * Reactor 节点是否可下钻，看 inlineBlocks 是否有子节点
 * @param reactor Reactor 节点
 */
export const canReactorDrilldown = (reactor: FlowNodeEntity): boolean =>
  !!reactor?.lastCollapsedChild?.collapsedChildren.length;

/**
 * 是否是 reactor 内部
 * @param entity
 * @returns
 */
export const insideReactor = (entity?: FlowNodeEntity): boolean =>
  entity?.parent?.flowNodeType === ReactorNodeType.ReactorPort;

/**
 * 判断是否是 Reactor 节点
 * @param entity
 * @returns
 */
export const isReactor = (entity?: FlowNodeEntity): boolean => !!entity?.getNodeMeta().isReactor;

/**
 * 获取在页面上实际渲染的第一个 Child 节点
 * @param node
 */
export const getDisplayFirstChildTransform = (
  transform: FlowNodeTransformData,
): FlowNodeTransformData => {
  if (transform.firstChild) {
    return getDisplayFirstChildTransform(transform.firstChild);
  }

  return transform;
};
