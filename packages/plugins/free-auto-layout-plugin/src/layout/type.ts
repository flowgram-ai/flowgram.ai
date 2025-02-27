import type { WorkflowLineEntity, WorkflowNodeEntity } from '@flowgram.ai/free-layout-core';

import { LayoutStore } from './store';

export interface LayoutNode {
  id: string;
  /** 节点索引 */
  index: string;
  /** 节点实体 */
  entity: WorkflowNodeEntity;
  /** 层级 */
  rank: number;
  /** 顺序 */
  order: number;
  /** 位置 */
  position: {
    x: number;
    y: number;
  };
  /** 偏移量 */
  offset: {
    x: number;
    y: number;
  };
  /** 宽高 */
  size: {
    width: number;
    height: number;
  };
  /** 是否存在子节点 */
  hasChildren: boolean;
  /** 被跟随节点 */
  followedBy?: string[];
  /** 跟随节点 */
  followTo?: string;
}

export interface LayoutEdge {
  id: string;
  /** 线条实体 */
  entity: WorkflowLineEntity;
  /** 起点 */
  from: string;
  /** 终点 */
  to: string;
  /** 起点索引 */
  fromIndex: string;
  /** 终点索引 */
  toIndex: string;
  /** 线条名称 */
  name: string;
}

export interface DagreNode {
  width: number;
  height: number;
  order: number;
  rank: number;
}

export interface LayoutParams {
  nodes: WorkflowNodeEntity[];
  edges: WorkflowLineEntity[];
}

export interface LayoutOptions {
  getFollowNode?: GetFollowNode;
}

export type GetFollowNode = (
  node: LayoutNode,
  context: {
    store: LayoutStore;
    /** 业务自定义参数 */
    [key: string]: any;
  }
) =>
  | {
      followTo?: string;
    }
  | undefined;
