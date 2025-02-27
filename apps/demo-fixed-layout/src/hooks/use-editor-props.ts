import { useMemo } from 'react';

import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createGroupPlugin } from '@flowgram.ai/group-plugin';
import { defaultFixedSemiMaterials } from '@flowgram.ai/fixed-semi-materials';
import {
  FixedLayoutProps,
  FlowDocumentJSON,
  FlowLayoutDefault,
  FlowRendererKey,
  ShortcutsRegistry,
} from '@flowgram.ai/fixed-layout-editor';

import { type FlowNodeRegistry } from '../typings';
import { shortcutGetter } from '../shortcuts';
import { GroupBoxHeader, GroupNode } from '../plugins/group-plugin';
import { createVariablePlugin, createClipboardPlugin } from '../plugins';
import { defaultFormMeta } from '../nodes';
import { SelectorBoxPopover } from '../components/selector-box-popover';
import NodeAdder from '../components/node-adder';
import BranchAdder from '../components/branch-adder';
import { BaseNode } from '../components/base-node';
import { DragNode } from '../components';

export function useEditorProps(
  initialData: FlowDocumentJSON,
  nodeRegistries: FlowNodeRegistry[]
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
            /**
             * Default expanded
             * 默认展开所有节点
             */
            defaultExpanded: true,
          },
          /**
           * Default FormMeta
           * 默认的表单配置
           */
          formMeta: defaultFormMeta,
        };
      },
      /**
       * Set default layout
       */
      defaultLayout: FlowLayoutDefault.VERTICAL_FIXED_LAYOUT, // or FlowLayoutDefault.HORIZONTAL_FIXED_LAYOUT
      /**
       * Style config
       */
      // constants: {
      //   [ConstantKeys.NODE_SPACING]: 24,
      //   [ConstantKeys.INLINE_SPACING_BOTTOM]: 24,
      //   [ConstantKeys.INLINE_BLOCKS_INLINE_SPACING_BOTTOM]: 13,
      //   [ConstantKeys.ROUNDED_LINE_X_RADIUS]: 8,
      //   [ConstantKeys.ROUNDED_LINE_Y_RADIUS]: 10,
      //   [ConstantKeys.INLINE_BLOCKS_INLINE_SPACING_TOP]: 23,
      //   [ConstantKeys.INLINE_BLOCKS_PADDING_BOTTOM]: 30,
      //   [ConstantKeys.COLLAPSED_SPACING]: 10,
      //   [ConstantKeys.BASE_COLOR]: '#B8BCC1',
      //   [ConstantKeys.BASE_ACTIVATED_COLOR]: '#82A7FC',
      // },
      /**
       * SelectBox config
       */
      selectBox: {
        SelectorBoxPopover,
      },
      // Config shortcuts
      shortcuts: (registry: ShortcutsRegistry, ctx) => {
        registry.addHandlers(...shortcutGetter.map((getter) => getter(ctx)));
      },
      /**
       * Drag/Drop config
       */
      dragdrop: {
        /**
         * Callback when drag drop
         */
        onDrop: (ctx, dropData) => {
          // console.log(
          //   '>>> onDrop: ',
          //   dropData.dropNode.id,
          //   dropData.dragNodes.map(n => n.id),
          // );
        },
        canDrop: (ctx, dropData) =>
          // console.log(
          //   '>>> canDrop: ',
          //   dropData.isBranch,
          //   dropData.dropNode.id,
          //   dropData.dragNodes.map(n => n.id),
          // );
          true,
      },
      /**
       * Redo/Undo enable
       */
      history: {
        enable: true,
        enableChangeNode: true, // Listen Node engine data change
        onApply(ctx, opt) {
          // Listen change to trigger auto save
          // console.log('auto save: ', ctx.document.toJSON(), opt);
        },
      },
      /**
       * Node engine enable, you can configure formMeta in the FlowNodeRegistry
       */
      nodeEngine: {
        enable: true,
      },
      /**
       * Variable engine enable
       */
      variableEngine: {
        enable: true,
      },
      /**
       * Materials, components can be customized based on the key
       * @see @see https://github.com/flowgram-ai/flowgram.ai/blob/main/packages/materials/fixed-semi-materials/src/components/index.tsx
       * 可以通过 key 自定义 UI 组件
       */
      materials: {
        renderNodes: {
          ...defaultFixedSemiMaterials,
          [FlowRendererKey.ADDER]: NodeAdder,
          [FlowRendererKey.BRANCH_ADDER]: BranchAdder,
          [FlowRendererKey.DRAG_NODE]: DragNode,
        },
        renderDefaultNode: BaseNode, // node render
        renderTexts: {
          'loop-end-text': 'Loop End',
          'loop-while-text': 'Condition Satisfied',
          'loop-traverse-text': 'Loop',
        },
      },
      /**
       * Playground init
       */
      onInit: (ctx) => {
        /**
         * Data can also be dynamically loaded via fromJSON
         * 也可以通过 fromJSON 动态加载数据
         */
        // ctx.document.fromJSON(initialData)
        console.log('---- Playground Init ----');
      },
      /**
       * Playground render
       */
      onAllLayersRendered: (ctx) => {
        setTimeout(() => {
          ctx.playground.config.fitView(ctx.document.root.bounds.pad(30));
        }, 10);
      },
      /**
       * Playground dispose
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
        /**
         * Group plugin
         * 分组插件
         */
        createGroupPlugin({
          components: {
            GroupBoxHeader,
            GroupNode,
          },
        }),
        /**
         * Variable plugin
         * 变量插件
         */
        createVariablePlugin({}),
        /**
         * Clipboard plugin
         * 剪切板插件
         */
        createClipboardPlugin(),
      ],
    }),
    []
  );
}
