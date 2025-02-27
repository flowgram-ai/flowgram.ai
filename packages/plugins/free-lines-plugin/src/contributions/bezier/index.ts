export {
  BezierControlType,
  getBezierHorizontalControlPoints,
  getBezierVerticalControlPoints,
} from './bezier-controls';
import { Bezier } from 'bezier-js';
import { IPoint, Point, Rectangle } from '@flowgram.ai/utils';
import {
  POINT_RADIUS,
  WorkflowLineEntity,
  WorkflowLineRenderContribution,
} from '@flowgram.ai/free-layout-core';
import { LineType } from '@flowgram.ai/free-layout-core';

import { LINE_PADDING } from '../../constants/lines';
import {
  getBezierHorizontalControlPoints,
  getBezierVerticalControlPoints,
} from './bezier-controls';

export interface BezierData {
  fromPos: IPoint;
  toPos: IPoint;
  bbox: Rectangle; // 外围矩形
  controls: IPoint[]; // 控制点
  bezier: Bezier;
  path: string;
}

export class WorkflowBezierLineContribution implements WorkflowLineRenderContribution {
  public static type = LineType.BEZIER;

  public entity: WorkflowLineEntity;

  constructor(entity: WorkflowLineEntity) {
    this.entity = entity;
  }

  private data?: BezierData;

  public get path(): string {
    return this.data?.path ?? '';
  }

  public calcDistance(pos: IPoint): number {
    if (!this.data) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Point.getDistance(pos, this.data.bezier.project(pos));
  }

  public get bounds(): Rectangle {
    if (!this.data) {
      return new Rectangle();
    }
    return this.data.bbox;
  }

  public update(params: { fromPos: IPoint; toPos: IPoint }): void {
    this.data = this.calcBezier(params.fromPos, params.toPos);
  }

  private calcBezier(fromPos: IPoint, toPos: IPoint): BezierData {
    const controls = this.entity.vertical
      ? getBezierVerticalControlPoints(fromPos, toPos)
      : getBezierHorizontalControlPoints(fromPos, toPos);
    const bezier = new Bezier([fromPos, ...controls, toPos]);
    const bbox = bezier.bbox();
    const bboxBounds = new Rectangle(
      bbox.x.min,
      bbox.y.min,
      bbox.x.max - bbox.x.min,
      bbox.y.max - bbox.y.min
    );

    const path = this.getPath({ bbox: bboxBounds, fromPos, toPos, controls });

    this.data = {
      fromPos,
      toPos,
      bezier,
      bbox: bboxBounds,
      controls,
      path,
    };
    return this.data;
  }

  private getPath(params: {
    bbox: Rectangle;
    fromPos: IPoint;
    toPos: IPoint;
    controls: IPoint[];
  }): string {
    const { bbox } = params;
    // 相对位置转换函数
    const toRelative = (p: IPoint): IPoint => ({
      x: p.x - bbox.x + LINE_PADDING,
      y: p.y - bbox.y + LINE_PADDING,
    });
    const fromPos = toRelative(params.fromPos);
    const toPos = toRelative(params.toPos);

    const controls = params.controls.map((c) => toRelative(c));

    // 渲染端点位置计算
    const renderToPos: IPoint = this.entity.vertical
      ? { x: toPos.x, y: toPos.y - POINT_RADIUS }
      : { x: toPos.x - POINT_RADIUS, y: toPos.y };

    const getPathData = (): string => {
      const controlPoints = controls.map((s) => `${s.x} ${s.y}`).join(',');
      const curveType = controls.length === 1 ? 'S' : 'C';

      if (this.entity.vertical) {
        return `M${fromPos.x} ${fromPos.y + POINT_RADIUS} ${curveType} ${controlPoints}, ${
          renderToPos.x
        } ${renderToPos.y}`;
      }
      return `M${fromPos.x + POINT_RADIUS} ${fromPos.y} ${curveType} ${controlPoints}, ${
        renderToPos.x
      } ${renderToPos.y}`;
    };
    const path = getPathData();
    return path;
  }
}
