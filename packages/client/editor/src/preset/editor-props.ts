import { VariablePluginOptions } from '@flowgram.ai/variable-plugin';
import { ReduxDevToolPluginOptions } from '@flowgram.ai/redux-devtool-plugin';
import { PlaygroundReactProps, SelectionService } from '@flowgram.ai/playground-react';
import { NodeCorePluginOptions } from '@flowgram.ai/node-core-plugin';
import { MaterialsPluginOptions } from '@flowgram.ai/materials-plugin';
import { I18nPluginOptions } from '@flowgram.ai/i18n-plugin';
import { HistoryPluginOptions } from '@flowgram.ai/history';
import { FlowNodeFormData, FormMetaOrFormMetaGenerator } from '@flowgram.ai/form-core';
import {
  FlowDocument,
  FlowDocumentJSON,
  FlowNodeEntity,
  type FlowNodeJSON,
  FlowNodeRegistry,
  FlowNodeType,
  FlowTransitionLabel,
  FlowTransitionLine,
} from '@flowgram.ai/document';
import { PluginContext } from '@flowgram.ai/core';

import { EditorOptions } from '../constants';

export interface EditorPluginContext extends PluginContext {
  document: FlowDocument;
  selection: SelectionService;
}

/**
 * 固定布局配置
 */
export interface EditorProps<
  CTX extends EditorPluginContext = EditorPluginContext,
  JSON = FlowDocumentJSON
> extends PlaygroundReactProps<CTX> {
  /**
   * 初始化数据
   */
  initialData?: JSON;
  /**
   * 是否为 readonly
   */
  readonly?: boolean;
  /**
   * 节点定义
   */
  nodeRegistries?: FlowNodeRegistry[];
  /**
   * 获取默认的节点配置
   */
  getNodeDefaultRegistry?: (type: FlowNodeType) => FlowNodeRegistry;
  /**
   * 节点引擎配置
   */
  nodeEngine?: NodeCorePluginOptions & {
    /**
     * 默认FormMeta
     */
    createDefaultFormMeta?: (node: FlowNodeEntity) => FormMetaOrFormMetaGenerator;
    /**
     * 开启
     */
    enable?: boolean;
  };
  /**
   * 默认是否展开所有节点
   */
  allNodesDefaultExpanded?: boolean;
  /**
   * 画布物料
   */
  materials?: MaterialsPluginOptions;
  /**
   * 画布数据加载完成, 请使用 onAllLayersRendered 替代
   * @deprecated
   * */
  onLoad?: (ctx: CTX) => void;
  /**
   * 是否开启变量引擎
   */
  variableEngine?: VariablePluginOptions;
  /**
   * 是否开启历史
   */
  history?: HistoryPluginOptions<CTX> & { disableShortcuts?: boolean };

  /**
   * redux 开发者工具配置
   */
  reduxDevTool?: ReduxDevToolPluginOptions;

  scroll?: {
    disableScrollLimit?: boolean; // 关闭滚动限制
    disableScrollBar?: boolean; //  关闭滚动条
  };

  /**
   * 节点转
   * @param node
   */
  toNodeJSON?(node: FlowNodeEntity): FlowNodeJSON;
  fromNodeJSON?(node: FlowNodeEntity, json: FlowNodeJSON): void;

  /**
   * 画布内部常量自定义
   */
  constants?: Record<string, any>;
  /**
   * 自定义节点线条
   */
  formatNodeLines?: (node: FlowNodeEntity, lines: FlowTransitionLine[]) => FlowTransitionLine[];
  /**
   * 自定义节点 label
   */
  formatNodeLabels?: (node: FlowNodeEntity, lines: FlowTransitionLabel[]) => FlowTransitionLabel[];
  /**
   * 国际化
   */
  i18n?: I18nPluginOptions;
}

export namespace EditorProps {
  /**
   * 默认配置
   */
  export const DEFAULT: EditorProps = {
    background: {},
    fromNodeJSON(node: FlowNodeEntity, json: FlowNodeJSON) {
      const formData = node.getData(FlowNodeFormData)!;
      // 如果没有使用表单引擎，将 data 数据填入 extInfo
      if (!formData) {
        if (json.data) {
          node.updateExtInfo(json.data);
        }
      } else {
        const defaultFormMeta = node
          .getService<EditorProps>(EditorOptions)
          .nodeEngine?.createDefaultFormMeta?.(node);

        const formMeta = node.getNodeRegistry()?.formMeta || defaultFormMeta;

        if (formMeta) {
          formData.createForm(formMeta, json.data);
        }
      }
    },
    toNodeJSON(node: FlowNodeEntity): FlowNodeJSON {
      const nodesMap: Record<string, FlowNodeJSON> = {};
      let startNodeJSON: FlowNodeJSON;
      node.document.traverse((node) => {
        const isSystemNode = node.id.startsWith('$');
        if (isSystemNode) return;
        const formData = node.getData(FlowNodeFormData);
        let formJSON =
          formData && formData.formModel && formData.formModel.initialized
            ? formData.toJSON()
            : undefined;
        const nodeJSON = {
          id: node.id,
          type: node.flowNodeType,
          data: formData ? formJSON : node.getExtInfo(),
          blocks: [],
        };
        if (!startNodeJSON) startNodeJSON = nodeJSON;
        let { parent } = node;
        if (parent && parent.id.startsWith('$')) {
          parent = parent.originParent;
        }
        const parentJSON = parent ? nodesMap[parent.id] : undefined;
        if (parentJSON) {
          parentJSON.blocks?.push(nodeJSON);
        }
        nodesMap[node.id] = nodeJSON;
      }, node);
      return startNodeJSON!;
    },
  };
}
