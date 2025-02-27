import { PreviewEditor } from '../preview-editor';
import { FixedLayoutSimple } from './index';

const indexCode = {
  code: `import { FixedLayoutEditorProvider, EditorRenderer } from '@flowgram.ai/fixed-layout-editor';

import '@flowgram.ai/fixed-layout-editor/index.css';
import './index.css'

import { useEditorProps } from './use-editor-props';
import { initialData } from './initial-data'
import { nodeRegistries } from './node-registries'
import { Tools } from './tools'
import { Minimap } from './minimap'

export const Editor = () => {
  const editorProps = useEditorProps(initialData, nodeRegistries);
  return (
    <FixedLayoutEditorProvider {...editorProps}>
      <div className="demo-fixed-container">
        <EditorRenderer>{/* add child panel here */}</EditorRenderer>
      </div>
      <Tools />
      <Minimap />
    </FixedLayoutEditorProvider>
  );
}`,
  active: true,
};

const indexCssCode = `.demo-fixed-node {
  align-items: flex-start;
  background-color: #fff;
  border: 1px solid rgba(6, 7, 9, 0.15);
  border-radius: 8px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.04), 0 4px 12px 0 rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  width: 360px;
  transition: all 0.3s ease;
}

.demo-fixed-node-title {
  background-color: #93bfe2;
  width: 100%;
  border-radius: 8px 8px 0 0;
  padding: 4px 12px;
}
.demo-fixed-node-content {
  padding: 16px;
  flex-grow: 1;
  width: 100%;
}

.demo-fixed-adder {
  width: 28px;
  height: 18px;
  background: rgb(187, 191, 196);
  display: flex;
  border-radius: 9px;
  justify-content: space-evenly;
  align-items: center;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      width: 12px;
      height: 12px;
    }
  }
}

.demo-fixed-adder.activated {
  background: #82A7FC
}

.demo-fixed-adder.isHorizontal {
  transform: rotate(90deg);
}


.gedit-playground * {
  box-sizing: border-box;
}`;

const initialDataCode = `import { FlowDocumentJSON } from '@flowgram.ai/fixed-layout-editor';

/**
 * 配置流程数据，数据为 blocks 嵌套的格式
 */
export const initialData: FlowDocumentJSON = {
  nodes: [
    // 开始节点
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: 'Start',
        content: 'start content'
      },
      blocks: [],
    },
    // 分支节点
    {
      id: 'condition_0',
      type: 'condition',
      data: {
        title: 'Condition'
      },
      blocks: [
        {
          id: 'branch_0',
          type: 'block',
          data: {
            title: 'Branch 0',
            content: 'branch 1 content'
          },
          blocks: [
            {
              id: 'custom_0',
              type: 'custom',
              data: {
                title: 'Custom',
                content: 'custrom content'
              },
            },
          ],
        },
        {
          id: 'branch_1',
          type: 'block',
          data: {
            title: 'Branch 1',
            content: 'branch 1 content'
          },
          blocks: [],
        },
      ],
    },
    // 结束节点
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: 'End',
        content: 'end content'
      },
    },
  ],
};`;

const nodeRegistriesCode = `import { FlowNodeRegistry } from '@flowgram.ai/fixed-layout-editor';
import { nanoid } from 'nanoid';

/**
 * 自定义节点注册
 */
export const nodeRegistries: FlowNodeRegistry[] = [
  {
    /**
     * 自定义节点类型
     */
    type: 'condition',
    /**
     * 自定义节点扩展:
     *  - loop: 扩展为循环节点
     *  - start: 扩展为开始节点
     *  - dynamicSplit: 扩展为分支节点
     *  - end: 扩展为结束节点
     *  - tryCatch: 扩展为 tryCatch 节点
     *  - default: 扩展为普通节点 (默认)
     */
    extend: 'dynamicSplit',
    /**
     * 节点配置信息
     */
    meta: {
      // isStart: false, // 是否为开始节点
      // isNodeEnd: false, // 是否为结束节点，结束节点后边无法再添加节点
      // draggable: false, // 是否可拖拽，如开始节点和结束节点无法拖拽
      // selectable: false, // 触发器等开始节点不能被框选
      // deleteDisable: true, // 禁止删除
      // copyDisable: true, // 禁止copy
      // addDisable: true, // 禁止添加
    },
    onAdd() {
      return {
        id: \`condition_\${nanoid(5)}\`,
        type: 'condition',
        data: {
          title: 'Condition',
        },
        blocks: [
          {
            id: nanoid(5),
            type: 'block',
            data: {
              title: 'If_0',
            },
          },
          {
            id: nanoid(5),
            type: 'block',
            data: {
              title: 'If_1',
            },
          },
        ],
      };
    },
  },
  {
    type: 'custom',
    meta: {},
    onAdd() {
      return {
        id: \`custom_\${nanoid(5)}\`,
        type: 'custom',
        data: {
          title: 'Custom',
          content: 'this is custom content'
        }
      }
    }
  }
];`;

const useEditorPropsCode = `import { useMemo } from 'react';

import { defaultFixedSemiMaterials } from '@flowgram.ai/fixed-semi-materials';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import {
  type FixedLayoutProps,
  FlowDocumentJSON,
  FlowNodeRegistry,
  FlowTextKey,
  Field,
  FlowRendererKey,
} from '@flowgram.ai/fixed-layout-editor';

import { BaseNode } from './base-node'
import { BranchAdder } from './branch-adder'
import { NodeAdder } from '../components/node-adder';

/** semi materials */

export function useEditorProps(
  initialData: FlowDocumentJSON, // 初始化数据
  nodeRegistries: FlowNodeRegistry[], // 节点定义
): FixedLayoutProps {
  return useMemo<FixedLayoutProps>(
    () => ({
      /**
       * Whether to enable the background
       */
      background: true,
      /**
       * Whether it is read-only or not, the node cannot be dragged in read-only mode
       */
      readonly: false,
      /**
       * Initial data
       * 初始化数据
       */
      initialData,
      /**
       * 画布节点定义
       */
      nodeRegistries,
      /**
       * Get the default node registry, which will be merged with the 'nodeRegistries'
       * 提供默认的节点注册，这个会和 nodeRegistries 做合并
       */
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
          },
          formMeta: {
            /**
             * Render form
             */
            render: () => <>
              <Field<string> name="title">
                {({ field }) => <div className="demo-fixed-node-title">{field.value}</div>}
              </Field>
              <div className="demo-fixed-node-content">
                <Field<string> name="content">
                  <input />
                </Field>
              </div>
            </>
          }
        };
      },
      /**
       * Materials, components can be customized based on the key
       * 可以通过 key 自定义 UI 组件
       */
      materials: {
        renderNodes: {
          ...defaultFixedSemiMaterials,
          /**
           * Components can be customized based on key business-side requirements.
           * 这里可以根据 key 业务侧定制组件
           */
          [FlowRendererKey.ADDER]: NodeAdder,
          [FlowRendererKey.BRANCH_ADDER]: BranchAdder,
          // [FlowRendererKey.DRAG_NODE]: DragNode,
        },
        renderDefaultNode: BaseNode, // 节点渲染
        renderTexts: {
          [FlowTextKey.LOOP_END_TEXT]: 'loop end',
          [FlowTextKey.LOOP_TRAVERSE_TEXT]: 'looping',
        },
      },
      /**
       * Node engine enable, you can configure formMeta in the FlowNodeRegistry
       */
      nodeEngine: {
        enable: true,
      },
      history: {
        enable: true,
        enableChangeNode: true, // Listen Node engine data change
        onApply(ctx, opt) {
          // Listen change to trigger auto save
          // console.log('auto save: ', ctx.document.toJSON(), opt);
        },
      },
      /**
       * 画布初始化
       */
      onInit: ctx => {
        /**
         * Data can also be dynamically loaded via fromJSON
         * 也可以通过 fromJSON 动态加载数据
         */
        // ctx.document.fromJSON(initialData)
        console.log('---- Playground Init ----');
      },
      /**
       * 画布销毁
       */
      onDispose: () => {
        console.log('---- Playground Dispose ----');
      },
      plugins: () => [
        /**
         * Minimap plugin
         * 缩略图插件
         */
        createMinimapPlugin({
          disableLayer: true,
          enableDisplayAllNodes: true,
          canvasStyle: {
            canvasWidth: 182,
            canvasHeight: 102,
            canvasPadding: 50,
            canvasBackground: 'rgba(245, 245, 245, 1)',
            canvasBorderRadius: 10,
            viewportBackground: 'rgba(235, 235, 235, 1)',
            viewportBorderRadius: 4,
            viewportBorderColor: 'rgba(201, 201, 201, 1)',
            viewportBorderWidth: 1,
            viewportBorderDashLength: 2,
            nodeColor: 'rgba(255, 255, 255, 1)',
            nodeBorderRadius: 2,
            nodeBorderWidth: 0.145,
            nodeBorderColor: 'rgba(6, 7, 9, 0.10)',
            overlayColor: 'rgba(255, 255, 255, 0)',
          },
          inactiveDebounceTime: 1,
        }),
      ],
    }),
    [],
  );
}
`;

const baseNodeCode = `import { FlowNodeEntity, useNodeRender } from '@flowgram.ai/fixed-layout-editor';

export const BaseNode = ({ node }: { node: FlowNodeEntity }) => {
  /**
   * Provides methods related to node rendering
   * 提供节点渲染相关的方法
   */
  const nodeRender = useNodeRender();
  /**
   * It can only be used when nodeEngine is enabled
   * 只有在节点引擎开启时候才能使用表单
   */
  const form = nodeRender.form;

  return (
    <div
      className="demo-fixed-node"
      onMouseEnter={nodeRender.onMouseEnter}
      onMouseLeave={nodeRender.onMouseLeave}
      onMouseDown={e => {
        // trigger drag node
        nodeRender.startDrag(e);
        e.stopPropagation();
      }}
      style={{
        ...(nodeRender.isBlockOrderIcon || nodeRender.isBlockIcon ? { width: 260 } : {}),
      }}
    >
      {form?.render()}
    </div>
  );
};
`;

const branchAdderCode = `import { type FlowNodeEntity, useClientContext } from '@flowgram.ai/fixed-layout-editor';
import { IconPlus } from '@douyinfe/semi-icons';
import { nanoid } from 'nanoid';


interface PropsType {
  activated?: boolean;
  node: FlowNodeEntity;
}


export function BranchAdder(props: PropsType) {
  const { activated, node } = props;
  const nodeData = node.firstChild!.renderData;
  const ctx = useClientContext();
  const { operation, playground } = ctx;
  const { isVertical } = node;

  function addBranch() {
    const block = operation.addBlock(node, {
      id: \`branch_\${nanoid(5)}\`,
      type: 'block',
      data: {
        title: 'New Branch',
        content: ''
      }
    });

    setTimeout(() => {
      playground.scrollToView({
        bounds: block.bounds,
        scrollToCenter: true,
      });
    }, 10);
  }
  if (playground.config.readonlyOrDisabled) return null;

  const className = [
    'demo-fixed-adder',
    isVertical ? '' : 'isHorizontal',
    activated ? 'activated' : ''
  ].join(' ');

  return (
    <div
      className={className}
      onMouseEnter={() => nodeData?.toggleMouseEnter()}
      onMouseLeave={() => nodeData?.toggleMouseLeave()}
    >
      <div
        onClick={() => {
          addBranch();
        }}
        aria-hidden="true"
        style={{ flexGrow: 1, textAlign: 'center' }}
      >
        <IconPlus />
      </div>
    </div>
  );
}
`;

const miniMapCode = `import { FlowMinimapService, MinimapRender } from '@flowgram.ai/minimap-plugin';
import { useService } from '@flowgram.ai/fixed-layout-editor';


export const Minimap = () => {
  const minimapService = useService(FlowMinimapService);
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        bottom: 51,
        zIndex: 100,
        width: 182,
      }}
    >
      <MinimapRender
        service={minimapService}
        containerStyles={{
          pointerEvents: 'auto',
          position: 'relative',
          top: 'unset',
          right: 'unset',
          bottom: 'unset',
          left: 'unset',
        }}
        inactiveStyle={{
          opacity: 1,
          scale: 1,
          translateX: 0,
          translateY: 0,
        }}
      />
    </div>
  );
};
`;

const nodeAdderCode = `import { FlowNodeEntity, FlowOperationService, useClientContext, usePlayground, useService } from "@flowgram.ai/fixed-layout-editor"

import { Dropdown } from '@douyinfe/semi-ui'

import { IconPlusCircle } from "@douyinfe/semi-icons";
import { nodeRegistries } from '../node-registries';

export const NodeAdder = (props: {
  from: FlowNodeEntity;
  to?: FlowNodeEntity;
  hoverActivated: boolean;
}) => {
  const { from, hoverActivated } = props;
  const playground = usePlayground();
  const context = useClientContext();
  const flowOperationService = useService(FlowOperationService) as FlowOperationService;

  const add = (addProps: any) => {
    const blocks = addProps.blocks ? addProps.blocks : undefined;
    const block = flowOperationService.addFromNode(from, {
      ...addProps,
      blocks,
    });
    setTimeout(() => {
      playground.scrollToView({
        bounds: block.bounds,
        scrollToCenter: true,
      });
    }, 10);
  };

  if (playground.config.readonlyOrDisabled) return null;

  return (
    <Dropdown
      render={
        <Dropdown.Menu>
          {nodeRegistries.map(registry => <Dropdown.Item onClick={() => {
            const props = registry?.onAdd(context, from);
            add(props);
          }}>{registry.type}</Dropdown.Item>)}
        </Dropdown.Menu>
      }
    >
      <div
        style={{
          width: hoverActivated ? 15 : 6,
          height: hoverActivated ? 15 : 6,
          backgroundColor: 'rgb(143, 149, 158)',
          color: '#fff',
          borderRadius: '50%',
          cursor: 'pointer'
        }}
      >
        {hoverActivated ?
          <IconPlusCircle
            style={{
              color: '#3370ff',
              backgroundColor: '#fff',
              borderRadius: 15
            }}
          /> : null
        }
      </div>
    </Dropdown>
  );
}
`;

const toolsCode = `import { useEffect, useState } from 'react'
import { usePlaygroundTools, useClientContext } from '@flowgram.ai/fixed-layout-editor';

export function Tools() {
  const { history } = useClientContext();
  const tools = usePlaygroundTools();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const disposable = history.undoRedoService.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => disposable.dispose();
  }, [history]);

  return <div style={{ position: 'absolute', zIndex: 10, bottom: 16, left: 16, display: 'flex', gap: 8 }}>
    <button onClick={() => tools.zoomin()}>ZoomIn</button>
    <button onClick={() => tools.zoomout()}>ZoomOut</button>
    <button onClick={() => tools.fitView()}>Fitview</button>
    <button onClick={() => tools.changeLayout()}>ChangeLayout</button>
    <button onClick={() => history.undo()} disabled={!canUndo}>Undo</button>
    <button onClick={() => history.redo()} disabled={!canRedo}>Redo</button>
    <span>{Math.floor(tools.zoom * 100)}%</span>
  </div>
}
`;

export const FixedLayoutSimplePreview = () => (
  <PreviewEditor
    files={{
      'App.js': `import React from 'react';
      import { Editor } from './index.tsx';
      const App = () => {
        return <Editor />
      }
        export default App;`,
      'index.tsx': indexCode,
      'index.css': indexCssCode,
      'initial-data.ts': initialDataCode,
      'node-registries.ts': nodeRegistriesCode,
      'use-editor-props.tsx': useEditorPropsCode,
      'base-node.tsx': baseNodeCode,
      'branch-adder.tsx': branchAdderCode,
      'minimap.tsx': miniMapCode,
      'node-adder.tsx': nodeAdderCode,
      'tools.tsx': toolsCode,
    }}
    previewStyle={{
      height: 500,
    }}
    editorStyle={{
      height: 500,
    }}
  >
    <FixedLayoutSimple />
  </PreviewEditor>
);
