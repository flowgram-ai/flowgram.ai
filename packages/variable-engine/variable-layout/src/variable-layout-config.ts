import { Scope } from '@flowgram.ai/variable-core';
import { VariableEngine } from '@flowgram.ai/variable-core';
import { FlowNodeEntity, FlowDocument } from '@flowgram.ai/document';

import { type FlowNodeScope, type ScopeChainNode } from './types';

interface TransformerContext {
  scope: FlowNodeScope;
  document: FlowDocument;
  variableEngine: VariableEngine;
}

export interface VariableLayoutConfig {
  /**
   * 开始节点的节点 Id
   */
  startNodeId?: string;
  /**
   * 节点的子节点输出变量，不能被后续节点所访问，用于固定布局场景
   * @param node
   * @returns
   */
  isNodeChildrenPrivate?: (node: ScopeChainNode) => boolean;

  /**
   * 用于自由画布场景，部分场景通过连线或者其他交互形式来表达节点之间的父子关系，需要可配置化
   */
  getFreeChildren?: (node: FlowNodeEntity) => FlowNodeEntity[];
  getFreeParent?: (node: FlowNodeEntity) => FlowNodeEntity | undefined;

  /**
   * 对依赖作用域进行微调
   */
  transformDeps?: (scopes: Scope[], ctx: TransformerContext) => Scope[];

  /**
   * 对依赖作用域进行微调
   */
  transformCovers?: (scopes: Scope[], ctx: TransformerContext) => Scope[];
}

export const VariableLayoutConfig = Symbol('VariableLayoutConfig');
