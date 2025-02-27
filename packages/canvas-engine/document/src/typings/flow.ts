import { FlowNodeEntity } from '../entities';
import { type FlowNodeMeta } from './flow-node-register';

export type FlowNodeType = string | number;

/**
 * Flow node json data
 */
export interface FlowNodeJSON {
  id: string;
  type?: FlowNodeType; // 如果缺省 则 为 block
  data?: Record<string, any>; // 节点额外扩展的内容
  meta?: FlowNodeMeta;
  blocks?: FlowNodeJSON[]; // 子节点
}

export type FlowDocumentJSON = {
  nodes: FlowNodeJSON[];
};

export enum FlowNodeBaseType {
  START = 'start', // 开始节点
  DEFAULT = 'default', // 默认节点类型
  ROOT = 'root', // 根节点
  EMPTY = 'empty', // 空节点，宽和高为 0
  INLINE_BLOCKS = 'inlineBlocks', // 所有块合并为 InlineBlocks
  BLOCK_ICON = 'blockIcon', // 图标节点，如条件分支的头部的 菱形图标
  BLOCK = 'block', // 块节点
  BLOCK_ORDER_ICON = 'blockOrderIcon', // 带顺序的图标节点，一般为 block 第一个分支节点
  GROUP = 'group', // 分组节点
  END = 'end', // 结束节点
  CONDITION = 'condition', // 可以连接多条线的条件判断节点，目前只支持横向布局
  SUB_CANVAS = 'subCanvas', // 自由布局子画布
}

export enum FlowNodeSplitType {
  DYNAMIC_SPLIT = 'dynamicSplit', // 动态分支
  STATIC_SPLIT = 'staticSplit', // 静态分支
}

export enum FlowDocumentConfigEnum {
  // 结束节点拖拽分支逻辑
  END_NODES_REFINE_BRANCH = 'END_NODES_REFINE_BRANCH',
}

export const FLOW_DEFAULT_HIDDEN_TYPES: FlowNodeType[] = [
  FlowNodeBaseType.ROOT,
  FlowNodeBaseType.INLINE_BLOCKS,
  FlowNodeBaseType.BLOCK,
];

export type AddNodeData = FlowNodeJSON & {
  originParent?: FlowNodeEntity;
  parent?: FlowNodeEntity;
  hidden?: boolean;
  index?: number;
};
