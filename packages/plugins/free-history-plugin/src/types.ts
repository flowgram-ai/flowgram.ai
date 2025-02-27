/* eslint-disable @typescript-eslint/naming-convention */
import { type IPoint } from '@flowgram.ai/utils';
import { type Operation, type OperationMeta } from '@flowgram.ai/history';
import {
  type WorkflowContentChangeType,
  type WorkflowContentChangeEvent,
  type WorkflowLineEntity,
  type WorkflowLinePortInfo,
  type WorkflowNodeJSON,
  type PositionMap,
} from '@flowgram.ai/free-layout-core';
import { type FlowNodeEntity, type FlowNodeJSON } from '@flowgram.ai/document';
import { type EntityData, type PluginContext } from '@flowgram.ai/core';

export enum FreeOperationType {
  addLine = 'addLine',
  deleteLine = 'deleteLine',
  moveNode = 'moveNode',
  addNode = 'addNode',
  deleteNode = 'deleteNode',
  changeNodeData = 'changeNodeData',
  resetLayout = 'resetLayout',
  dragNodes = 'dragNodes',
}

export interface AddOrDeleteLineOperationValue extends WorkflowLinePortInfo {
  id: string;
}

export interface AddOrDeleteWorkflowNodeOperationValue {
  node: WorkflowNodeJSON;
  parentID?: string;
}

export interface AddLineOperation extends Operation {
  type: FreeOperationType.addLine;
  value: AddOrDeleteLineOperationValue;
}

export interface DeleteLineOperation extends Operation {
  type: FreeOperationType.deleteLine;
  value: AddOrDeleteLineOperationValue;
}

export interface MoveNodeOperation extends Operation {
  type: FreeOperationType.moveNode;
  value: MoveNodeOperationValue;
}

export interface AddWorkflowNodeOperation extends Operation {
  type: FreeOperationType.addNode;
  value: AddOrDeleteWorkflowNodeOperationValue;
}

export interface DeleteWorkflowNodeOperation extends Operation {
  type: FreeOperationType.deleteNode;
  value: AddOrDeleteWorkflowNodeOperationValue;
}

export interface MoveNodeOperationValue {
  id: string;
  value: {
    x: number;
    y: number;
  };
  oldValue: {
    x: number;
    y: number;
  };
}

export interface DragNodeOperationValue {
  ids: string[];
  value: IPoint[];
  oldValue: IPoint[];
}

export interface ResetLayoutOperationValue {
  ids: string[];
  value: PositionMap;
  oldValue: PositionMap;
}

export interface ContentChangeTypeToOperation<T extends Operation> {
  type: WorkflowContentChangeType;
  toOperation: (
    event: WorkflowContentChangeEvent,
    ctx: PluginContext
  ) => T | undefined | Promise<T | undefined>;
}

export interface EntityDataType {
  type: FreeOperationType;
  toEntityData: (node: FlowNodeEntity, ctx: PluginContext) => EntityData;
}

export interface ChangeNodeDataValue {
  id: string;
  value: unknown;
  oldValue: unknown;
  path: string;
}

export interface ChangeNodeDataOperation extends Operation {
  type: FreeOperationType.changeNodeData;
  value: ChangeNodeDataValue;
}

/**
 * 将node转成json
 */
export type NodeToJson = (node: FlowNodeEntity) => FlowNodeJSON;
/**
 * 将line转成json
 */
export type LineToJson = (node: WorkflowLineEntity) => FlowNodeJSON;
/**
 * 根据节点id获取label
 */
export type GetNodeLabelById = (id: string) => string;
/**
 * 根据节点获取label
 */
export type GetNodeLabel = (node: FlowNodeJSON) => string;
/**
 * 根据分支获取label
 */
export type GetBlockLabel = (node: FlowNodeJSON) => string;
/**
 * 根据节点获取URI
 */
export type GetNodeURI = (id: string) => string | any;
/**
 * 根据连线获取URI
 */
export type GetLineURI = (id: string) => string | any;

/**
 * 插件配置
 */
export interface FreeHistoryPluginOptions {
  enable?: boolean;
  limit?: number;
  nodeToJSON?: (ctx: PluginContext) => NodeToJson;
  getNodeLabelById?: (ctx: PluginContext) => GetNodeLabelById;
  getNodeLabel?: (ctx: PluginContext) => GetNodeLabel;
  getBlockLabel?: (ctx: PluginContext) => GetBlockLabel;
  getNodeURI?: (ctx: PluginContext) => GetNodeURI;
  getLineURI?: (ctx: PluginContext) => GetLineURI;
  operationMetas?: OperationMeta[];
  enableChangeNode?: boolean;
  uri?: string | any;
}

export interface IHandler<E> {
  handle: (event: E, ctx: PluginContext) => void | Promise<void>;
}
