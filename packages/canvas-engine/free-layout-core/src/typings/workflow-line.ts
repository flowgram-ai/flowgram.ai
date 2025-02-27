import type { Rectangle, IPoint } from '@flowgram.ai/utils';

import { type WorkflowLineEntity } from '../entities';

export enum LineType {
  BEZIER, // 贝塞尔曲线
  LINE_CHART, // 折叠线
}

export type LineRenderType = LineType | string;

export interface LinePosition {
  from: IPoint;
  to: IPoint;
}

export interface LineColor {
  hidden: string;
  default: string;
  drawing: string;
  hovered: string;
  selected: string;
  error: string;
}

export enum LineColors {
  HIDDEN = 'transparent', // 隐藏线条
  DEFUALT = '#4d53e8',
  DRAWING = '#5DD6E3', // '#b5bbf8', // '#9197F1',
  HOVER = '#37d0ff',
  ERROR = 'red',
}

export interface WorkflowLineRenderContribution {
  entity: WorkflowLineEntity;
  path: string;
  bounds: Rectangle;
  update: (params: { fromPos: IPoint; toPos: IPoint }) => void;
  calcDistance: (pos: IPoint) => number;
}

export type WorkflowLineRenderContributionFactory = (new (
  entity: WorkflowLineEntity
) => WorkflowLineRenderContribution) & {
  type: LineRenderType;
};
