import React from 'react';

import { bindContributions } from '@flowgram.ai/utils';
import { FlowRendererRegistry } from '@flowgram.ai/renderer';
import {
  FlowNodeRegistry,
  FlowDocument,
  type FlowNodeEntity,
  FlowLayoutContribution,
} from '@flowgram.ai/document';
import { FlowNodeMeta } from '@flowgram.ai/document';
import { FlowNodeJSON } from '@flowgram.ai/document';
import { definePluginCreator } from '@flowgram.ai/core';

import { createReactorFromJSON } from './utils/create';
import { Reactor } from './reactor-node';
import { ReactorShrinkLayout } from './layout/reactor-shrink-layout';
import { reactorPort } from './extends/reactor-port';
import { reactorInlineBlocks } from './extends/reactor-inline-blocks';
import { reactorIcon } from './extends/reactor-icon';
import { RENDER_REACTOR_COLLAPSE_KEY, RENDER_REACTOR_PORT_KEY } from './constants';

export type MaterialReactComponent<T = any> = (props: T) => React.ReactNode | null;

export interface FixedReactorPluginOpts {
  extendReactorRegistry?: Partial<FlowNodeRegistry>;
  extendReactorIconRegistry?: Partial<FlowNodeMeta>;
  extendReactorPortRegistry?: Partial<FlowNodeRegistry>;
  extendReactorMeta?: Partial<FlowNodeMeta>;
  extendReactorIconMeta?: Partial<FlowNodeMeta>;
  extendReactorPortMeta?: Partial<FlowNodeMeta>;

  // 是否实现 Reactor 紧凑化布局
  shrink?: boolean;

  /**
   * 业务根据范例数据，将业务自定义的 JSON 结构转换成 reactor 模式渲染所依赖的 JSON 结构
   * 范例数据：
   * {
   *  type: 'reactor',
   *  id: 'reactor_parent',
   *  blocks: [
   *    {
   *      id: 'port_LnSdK',
   *      blocks: [{ type: 'reactor', id: 'reactor_child' }],
   *    },
   *    {
   *      id: 'port_60X7U',
   *    }
   *  ],
   * }
   * @param json
   * @returns
   */
  transformFlowNodeJSON?: (json?: FlowNodeJSON) => FlowNodeJSON;
  /**
   * 渲染 Reactor 端口
   */
  renderReactorPort: MaterialReactComponent<{ port: FlowNodeEntity }>;
  /**
   * 渲染 Reactor 展开收起按钮
   */
  renderReactorCollapse: MaterialReactComponent<{ reactor: FlowNodeEntity }>;
}

export const createFixedReactorPlugin = definePluginCreator<FixedReactorPluginOpts>({
  onBind({ bind }, opts) {
    // 如果要收缩，则注册收缩布局优化逻辑
    if (opts?.shrink) {
      bindContributions(bind, ReactorShrinkLayout, [FlowLayoutContribution]);
    }
  },
  onInit(ctx, opts): void {
    const { transformFlowNodeJSON } = opts;
    const document: FlowDocument = ctx.get(FlowDocument);

    const registry: FlowRendererRegistry = ctx.get<FlowRendererRegistry>(FlowRendererRegistry);

    document.registerFlowNodes({
      ...Reactor,
      ...(transformFlowNodeJSON
        ? {
            onCreate: (node, json) => createReactorFromJSON(node, transformFlowNodeJSON(json)),
          }
        : {}),
      ...(opts.extendReactorRegistry || {}),
      meta: {
        ...Reactor.meta,
        ...(opts.extendReactorMeta || {}),
      },
      extendChildRegistries: [
        {
          ...reactorIcon,
          meta: {
            ...reactorIcon.meta,
            ...(opts.extendReactorIconMeta || {}),
          },
          ...(opts.extendReactorIconRegistry || {}),
        },
        reactorInlineBlocks,
        {
          ...reactorPort,
          meta: {
            ...reactorPort.meta,
            ...(opts.extendReactorPortMeta || {}),
          },
          ...(opts.extendReactorPortRegistry || {}),
        },
      ],
    });

    registry.registerReactComponent(RENDER_REACTOR_PORT_KEY, opts.renderReactorPort);
    registry.registerReactComponent(RENDER_REACTOR_COLLAPSE_KEY, opts.renderReactorCollapse);
  },
});
