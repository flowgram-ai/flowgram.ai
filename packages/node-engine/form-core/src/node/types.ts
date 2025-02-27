import React from 'react';

import { FlowNodeEntity } from '@flowgram.ai/document';
import { PlaygroundContext } from '@flowgram.ai/core';

export interface NodeContext {
  node: FlowNodeEntity;
  playgroundContext: PlaygroundContext;
}

export type Render<T = any> = (props: T) => any;

export type NodePluginRender = Render<NodeContext>;

export type NodePlaceholderRender = Render<NodeContext>;

export interface NodeRenderProps {
  node: FlowNodeEntity;
}

export type NodeRenderHoc = (
  Component: React.JSXElementConstructor<NodeRenderProps>,
) => React.JSXElementConstructor<NodeRenderProps>;
