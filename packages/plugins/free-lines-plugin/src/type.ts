import { FC, ReactNode } from 'react';

import type {
  WorkflowLineEntity,
  WorkflowLineRenderContributionFactory,
} from '@flowgram.ai/free-layout-core';
import { LineRenderType } from '@flowgram.ai/free-layout-core';
import type { PluginContext } from '@flowgram.ai/core';

export interface LineRenderProps {
  key: string;
  color?: string; // 高亮颜色，优先级最高
  selected?: boolean;
  line: WorkflowLineEntity;
  lineType: LineRenderType;
  version: string; // 用于控制 memo 刷新
  strokePrefix?: string;
  children?: ReactNode;
}

export interface LinesLayerOptions {
  renderElement?: HTMLElement | (() => HTMLElement | undefined);
  renderInsideLine?: FC<LineRenderProps>;
}

export interface FreeLinesPluginOptions extends Omit<LinesLayerOptions, 'renderElement'> {
  renderElement?: HTMLElement | ((ctx: PluginContext) => HTMLElement | undefined);
  contributions?: WorkflowLineRenderContributionFactory[];
  defaultLineType?: LineRenderType;
}
