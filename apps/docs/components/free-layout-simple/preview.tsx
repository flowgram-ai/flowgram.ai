import { PreviewEditor } from '../preview-editor';
import { FreeLayoutSimple } from '.';

const indexCode = {
  code: `import {
  EditorRenderer,
  FreeLayoutEditorProvider,
} from '@flowgram.ai/free-layout-editor';

import { NodeAddPanel } from './components/node-add-panel';
import { Tools } from './components/tools'
import { Minimap } from './components/minimap'
import { useEditorProps } from './hooks/use-editor-props'
import '@flowgram.ai/free-layout-editor/index.css';
import './index.css';

export const Editor = () => {
  const editorProps = useEditorProps()
  return (
    <FreeLayoutEditorProvider {...editorProps}>
      <div className="demo-free-container">
        <div className="demo-free-layout">
          <NodeAddPanel />
          <EditorRenderer className="demo-free-editor" />
        </div>
        <Tools />
        <Minimap />
      </div>
    </FreeLayoutEditorProvider>
  )
};
  `,
  active: true,
};

const dataCode = `import { WorkflowJSON } from '@flowgram.ai/free-layout-editor';

export const initialData: WorkflowJSON = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      meta: {
        position: { x: 0, y: 0 },
      },
      data: {
        title: 'Start',
        content: 'Start content'
      },
    },
    {
      id: 'node_0',
      type: 'custom',
      meta: {
        position: { x: 400, y: 0 },
      },
      data: {
        title: 'Custom',
        content: 'Custom node content'
      },
    },
    {
      id: 'end_0',
      type: 'end',
      meta: {
        position: { x: 800, y: 0 },
      },
      data: {
        title: 'End',
        content: 'End content'
      },
    },
  ],
  edges: [
    {
      sourceNodeID: 'start_0',
      targetNodeID: 'node_0',
    },
    {
      sourceNodeID: 'node_0',
      targetNodeID: 'end_0',
    },
  ],
};


`;

const nodeAddPanelCode = `import React from 'react';

import { WorkflowDragService, useService } from '@flowgram.ai/free-layout-editor';

const cardkeys = ['Node1', 'Node2'];

export const NodeAddPanel: React.FC = props => {
  const startDragSerivce = useService<WorkflowDragService>(WorkflowDragService);

  return (
    <div className="demo-free-sidebar">
      {cardkeys.map(nodeType => (
        <div
          key={nodeType}
          className="demo-free-card"
          onMouseDown={e => startDragSerivce.startDragCard(nodeType, e, {
            data: {
              title: \`New \${nodeType}\`,
              content: 'xxxx'
            }
          })}
        >
          {nodeType}
        </div>
      ))}
    </div>
  );
};
`;

const useEditorPropsCode = `import { useMemo } from 'react';

import {
  FreeLayoutProps,
  WorkflowNodeProps,
  WorkflowNodeRenderer,
  Field,
  useNodeRender
} from '@flowgram.ai/free-layout-editor';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';

import { initialData } from '../initial-data';
import { nodeRegistries } from '../node-registries'

export const useEditorProps = () => useMemo<FreeLayoutProps>(
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
       * Node registries
       * 节点注册
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
                  {({ field }) => <div className="demo-free-node-title">{field.value}</div>}
                </Field>
                <div className="demo-free-node-content">
                  <Field<string> name="content">
                    <input />
                  </Field>
                </div>
              </>
          }
        };
      },
      materials: {
        /**
         * Render Node
         */
        renderDefaultNode: (props: WorkflowNodeProps) => {
          const { form } = useNodeRender()
          return (
            <WorkflowNodeRenderer className="demo-free-node" node={props.node}>
              {form?.render()}
            </WorkflowNodeRenderer>
          )
        },
      },
      /**
       * Content change
       */
      onContentChange(ctx, event) {
        // console.log('Auto Save: ', event, ctx.document.toJSON());
      },
      // /**
      //  * Node engine enable, you can configure formMeta in the FlowNodeRegistry
      //  */
      nodeEngine: {
        enable: true,
      },
      /**
       * Redo/Undo enable
       */
      history: {
        enable: true,
        enableChangeNode: true, // Listen Node engine data change
      },
      /**
       * Playground init
       */
      onInit: ctx => {},
      /**
       * Playground render
       */
      onAllLayersRendered(ctx) {
        //  Fitview
        ctx.document.fitView(false);
      },
      /**
       * Playground dispose
       */
      onDispose() {
        console.log('---- Playground Dispose ----');
      },
      plugins: () => [
        /**
         * Minimap plugin
         * 缩略图插件
         */
        createMinimapPlugin({
          disableLayer: true,
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
        /**
         * Snap plugin
         * 自动对齐及辅助线插件
         */
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
          alignLineWidth: 1,
          alignCrossWidth: 8,
        }),
      ]
    }),
    [],
  );

`;

const nodeRegistriesCode = `import { WorkflowNodeRegistry } from '@flowgram.ai/free-layout-editor';

/**
 * You can customize your own node registry
 * 你可以自定义节点的注册器
 */
export const nodeRegistries: WorkflowNodeRegistry[] = [
  {
    type: 'start',
    meta: {
      isStart: true, // Mark as start
      deleteDisable: true, // The start node cannot be deleted
      copyDisable: true, // The start node cannot be copied
      defaultPorts: [{ type: 'output' }], // Used to define the input and output ports, the start node only has the output port
    },
  },
  {
    type: 'end',
    meta: {
      deleteDisable: true,
      copyDisable: true,
      defaultPorts: [{ type: 'input' }],
    },
  },
  {
    type: 'custom',
    meta: {
    },
    defaultPorts: [{ type: 'output' }, { type: 'input' }], // A normal node has two ports
  },
];

`;

const toolsCode = `import { useEffect, useState } from 'react'
import { usePlaygroundTools, useClientContext } from '@flowgram.ai/free-layout-editor';

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

  return <div style={{ position: 'absolute', zIndex: 10, bottom: 16, left: 226, display: 'flex', gap: 8 }}>
    <button onClick={() => tools.zoomin()}>ZoomIn</button>
    <button onClick={() => tools.zoomout()}>ZoomOut</button>
    <button onClick={() => tools.fitView()}>Fitview</button>
    <button onClick={() => tools.autoLayout()}>AutoLayout</button>
    <button onClick={() => history.undo()} disabled={!canUndo}>Undo</button>
    <button onClick={() => history.redo()} disabled={!canRedo}>Redo</button>
    <span>{Math.floor(tools.zoom * 100)}%</span>
  </div>
}
`;

const minimapCode = `import { FlowMinimapService, MinimapRender } from '@flowgram.ai/minimap-plugin';
import { useService } from '@flowgram.ai/free-layout-editor';


export const Minimap = () => {
  const minimapService = useService(FlowMinimapService);
  return (
    <div
      style={{
        position: 'absolute',
        left: 226,
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
export const FreeLayoutSimplePreview = () => {
  const files = {
    'index.tsx': indexCode,
    'use-editor-props.tsx': useEditorPropsCode,
    'initial-data.ts': dataCode,
    'node-registries.ts': nodeRegistriesCode,
    'node-add-panel.tsx': nodeAddPanelCode,
    'tools.tsx': toolsCode,
    'minimap.tsx': minimapCode,
  };
  return (
    <PreviewEditor files={files} previewStyle={{ height: 500 }} editorStyle={{ height: 500 }}>
      <FreeLayoutSimple />
    </PreviewEditor>
  );
};
