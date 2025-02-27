import { injectable } from 'inversify';
import { type FlowNodeEntity, type FlowNodeJSON } from '@flowgram.ai/document';
import { type PluginContext } from '@flowgram.ai/core';

import {
  type FreeHistoryPluginOptions,
  type GetBlockLabel,
  type GetLineURI,
  type GetNodeLabel,
  type GetNodeLabelById,
  type GetNodeURI,
  type NodeToJson,
} from './types';

@injectable()
export class FreeHistoryConfig {
  init(ctx: PluginContext, options: FreeHistoryPluginOptions) {
    this.enable = !!options?.enable;

    if (options.nodeToJSON) {
      this.nodeToJSON = options.nodeToJSON(ctx);
    }

    if (options.getNodeLabelById) {
      this.getNodeLabelById = options.getNodeLabelById(ctx);
    }

    if (options.getNodeLabel) {
      this.getNodeLabel = options.getNodeLabel(ctx);
    }

    if (options.getBlockLabel) {
      this.getBlockLabel = options.getBlockLabel(ctx);
    }

    if (options.getNodeURI) {
      this.getNodeURI = options.getNodeURI(ctx);
    }

    if (options.getLineURI) {
      this.getLineURI = options.getLineURI(ctx);
    }
  }

  enable = false;

  nodeToJSON: NodeToJson = (node: FlowNodeEntity) => node.toJSON();

  getNodeLabelById: GetNodeLabelById = (id: string) => id;

  getNodeLabel: GetNodeLabel = (node: FlowNodeJSON) => node.id;

  getBlockLabel: GetBlockLabel = (node: FlowNodeJSON) => node.id;

  getNodeURI: GetNodeURI = (id: string) => `node:${id}`;

  getLineURI: GetLineURI = (id: string) => `line:${id}`;
}
