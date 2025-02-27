import React, { useCallback, useEffect, useContext, useMemo } from 'react';

import { useObserve } from '@flowgram.ai/reactive';
import { useStartDragNode } from '@flowgram.ai/fixed-drag-plugin';
import {
  usePlayground,
  FlowNodeBaseType,
  FlowNodeEntity,
  FlowNodeRenderData,
  useService,
  Disposable,
  PlaygroundEntityContext,
  NodeFormProps,
  getNodeForm,
} from '@flowgram.ai/editor';

import { FlowOperationService } from '../types';

export interface NodeRenderReturnType {
  /**
   * BlockOrderIcon节点，一般用于分支的第一个占位节点
   */
  isBlockOrderIcon: boolean;
  /**
   * BlockIcon 节点，一般用于带有分支的占位节点
   */
  isBlockIcon: boolean;
  /**
   * 当前节点 (如果是 icon 则会返回它的父节点)
   */
  node: FlowNodeEntity;
  /**
   * 是否在拖拽中
   */
  dragging: boolean;
  /**
   * 节点是否激活
   */
  activated: boolean;
  /**
   * 节点是否展开
   */
  expanded: boolean;
  /**
   * 触发拖拽
   * @param e
   */
  startDrag: (e: React.MouseEvent) => void;
  /**
   * 鼠标进入, 主要用于控制 activated 状态
   */
  onMouseEnter: (e: React.MouseEvent) => void;
  /**
   * 鼠标离开, 主要用于控制 activated 状态
   */
  onMouseLeave: (e: React.MouseEvent) => void;

  /**
   * 渲染表单，只有节点引擎开启才能使用
   */
  form: NodeFormProps<any> | undefined;

  /**
   * 获取节点的扩展数据
   */
  getExtInfo<T = any>(): T;

  /**
   * 更新节点的扩展数据
   * @param extInfo
   */
  updateExtInfo<T = any>(extInfo: T): void;

  /**
   * 展开/收起节点
   * @param expanded
   */
  toggleExpand(): void;

  /**
   * 删除节点
   */
  deleteNode: () => void;
  /**
   * 全局 readonly 状态
   */
  readonly: boolean;
}

/**
 * Provides methods related to node rendering
 * @param nodeFromProps
 */
export function useNodeRender(nodeFromProps?: FlowNodeEntity): NodeRenderReturnType {
  const renderNode = nodeFromProps || useContext<FlowNodeEntity>(PlaygroundEntityContext);
  const renderData = renderNode.getData<FlowNodeRenderData>(FlowNodeRenderData)!;
  const { expanded, dragging, activated } = renderData;
  const { startDrag: startDragOrigin } = useStartDragNode();
  const playground = usePlayground();
  const isBlockOrderIcon = renderNode.flowNodeType === FlowNodeBaseType.BLOCK_ORDER_ICON;
  const isBlockIcon = renderNode.flowNodeType === FlowNodeBaseType.BLOCK_ICON;
  const node = isBlockOrderIcon || isBlockIcon ? renderNode.parent! : renderNode;
  const operationService = useService<FlowOperationService>(FlowOperationService);
  const deleteNode = useCallback(() => {
    operationService.deleteNode(node);
  }, [node, operationService]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      startDragOrigin(e, { dragStartEntity: renderNode }, { dragOffsetX: 30, dragOffsetY: 30 });
    },
    [renderNode, startDragOrigin]
  );

  const onMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      renderData.toggleMouseEnter();
    },
    [renderData]
  );

  const onMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      renderData.toggleMouseLeave();
    },
    [renderData]
  );

  const toggleExpand = useCallback(() => {
    renderData.toggleExpand();
  }, [renderData]);

  const getExtInfo = useCallback(() => node.getExtInfo() as any, [node]);
  const updateExtInfo = useCallback(
    (data: any) => {
      node.updateExtInfo(data);
    },
    [node]
  );
  const form = useMemo(() => getNodeForm(node), [node]);
  // Listen FormState change
  const formState = useObserve<any>(form?.state);

  useEffect(() => {
    let dispose: Disposable | undefined;
    if (isBlockIcon || isBlockOrderIcon) {
      // icon 的扩展数据是存在父节点上
      dispose = renderNode.parent!.onExtInfoChange(() => renderNode.renderData.fireChange());
    }
    return () => dispose?.dispose();
  }, [renderNode, isBlockIcon, isBlockOrderIcon]);

  const readonly = playground.config.readonly;

  return useMemo(
    () => ({
      node,
      isBlockOrderIcon,
      isBlockIcon,
      activated,
      readonly,
      expanded,
      dragging,
      startDrag,
      deleteNode,
      onMouseEnter,
      onMouseLeave,
      getExtInfo,
      updateExtInfo,
      toggleExpand,
      get form() {
        if (!form) return undefined;
        return {
          ...form,
          get values() {
            return form.values!;
          },
          get state() {
            return formState;
          },
        };
      },
    }),
    [
      node,
      isBlockOrderIcon,
      isBlockIcon,
      activated,
      readonly,
      expanded,
      dragging,
      startDrag,
      deleteNode,
      onMouseEnter,
      onMouseLeave,
      getExtInfo,
      updateExtInfo,
      toggleExpand,
      form,
      formState,
    ]
  );
}
