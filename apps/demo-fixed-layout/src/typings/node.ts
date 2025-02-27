import {
  FlowNodeJSON as FlowNodeJSONDefault,
  FlowNodeRegistry as FlowNodeRegistryDefault,
  FixedLayoutPluginContext,
  FlowNodeEntity,
} from '@flowgram.ai/fixed-layout-editor';

import { type JsonSchema } from './json-schema';

export type FlowLiteralValueSchema = string | number | boolean;
export type FlowRefValueSchema =
  | { type: 'ref'; content?: string }
  | { type: 'expression'; content?: string }
  | { type: 'template'; content?: string };
export type FlowValueSchema = FlowLiteralValueSchema | FlowRefValueSchema;
/**
 * You can customize the data of the node, and here you can use JsonSchema to define the input and output of the node
 * 你可以自定义节点的 data 业务数据, 这里演示 通过 JsonSchema 来定义节点的输入/输出
 */
export interface FlowNodeJSON extends FlowNodeJSONDefault {
  data: {
    /**
     * Node title
     */
    title: string;
    /**
     * Inputs data values
     */
    inputsValues?: Record<string, FlowValueSchema>;
    /**
     * Define the inputs data of the node by JsonSchema
     */
    inputs?: JsonSchema;
    /**
     * Define the outputs data of the node by JsonSchema
     */
    outputs?: JsonSchema;
  };
}

/**
 * You can customize your own node registry
 * 你可以自定义节点的注册器
 */
export interface FlowNodeRegistry extends FlowNodeRegistryDefault {
  info: {
    icon: string;
    description: string;
  };
  canAdd?: (ctx: FixedLayoutPluginContext, from: FlowNodeEntity) => boolean;
  canDelete?: (ctx: FixedLayoutPluginContext, from: FlowNodeEntity) => boolean;
  onAdd?: (ctx: FixedLayoutPluginContext, from: FlowNodeEntity) => FlowNodeJSON;
}

export type FlowDocumentJSON = {
  nodes: FlowNodeJSON[];
};
