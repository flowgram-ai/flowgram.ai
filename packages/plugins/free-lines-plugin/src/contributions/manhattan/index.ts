import { IPoint, Point, Rectangle } from '@flowgram.ai/utils';
import {
  POINT_RADIUS,
  WorkflowLineEntity,
  WorkflowLineRenderContribution,
} from '@flowgram.ai/free-layout-core';

import { LINE_PADDING } from '../../constants/lines';

export interface ManhattanData {
  points: IPoint[];
  path: string;
  bbox: Rectangle;
}

export class WorkflowManhattanLineContribution implements WorkflowLineRenderContribution {
  public static type = 'WorkflowManhattanLineContribution';

  public entity: WorkflowLineEntity;

  constructor(entity: WorkflowLineEntity) {
    this.entity = entity;
  }

  private data?: ManhattanData;

  public get path(): string {
    return this.data?.path ?? '';
  }

  public calcDistance(pos: IPoint): number {
    if (!this.data) {
      return Number.MAX_SAFE_INTEGER;
    }
    // 计算点到所有线段的最小距离
    return Math.min(
      ...this.data.points.slice(1).map((point, index) => {
        const prevPoint = this.data!.points[index];
        return this.getDistanceToLineSegment(pos, prevPoint, point);
      })
    );
  }

  private getDistanceToLineSegment(point: IPoint, start: IPoint, end: IPoint): number {
    // 计算线段的方向向量
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 如果线段退化为一个点
    if (dx === 0 && dy === 0) {
      return Point.getDistance(point, start);
    }

    // 计算投影点的参数 t
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);

    // 如果投影点在线段外部，返回到端点的距离
    if (t < 0) return Point.getDistance(point, start);
    if (t > 1) return Point.getDistance(point, end);

    // 投影点在线段上，计算实际距离
    const projectionPoint = {
      x: start.x + t * dx,
      y: start.y + t * dy,
    };
    return Point.getDistance(point, projectionPoint);
  }

  public get bounds(): Rectangle {
    if (!this.data) {
      return new Rectangle();
    }
    return this.data.bbox;
  }

  public update(params: { fromPos: IPoint; toPos: IPoint }): void {
    const { fromPos, toPos } = params;
    const { vertical } = this.entity;

    const sourceOffset = {
      x: vertical ? 0 : POINT_RADIUS,
      y: vertical ? POINT_RADIUS : 0,
    };
    const targetOffset = {
      x: vertical ? 0 : -POINT_RADIUS,
      y: vertical ? -POINT_RADIUS : 0,
    };

    // 计算曼哈顿路径的点
    const points = this.getManhattanPoints({
      source: {
        x: fromPos.x + sourceOffset.x,
        y: fromPos.y + sourceOffset.y,
      },
      target: {
        x: toPos.x + targetOffset.x,
        y: toPos.y + targetOffset.y,
      },
      vertical,
    });

    const bbox = Rectangle.createRectangleWithTwoPoints(
      points.reduce(
        (min, p) => ({
          x: Math.min(min.x, p.x),
          y: Math.min(min.y, p.y),
        }),
        points[0]
      ),
      points.reduce(
        (max, p) => ({
          x: Math.max(max.x, p.x),
          y: Math.max(max.y, p.y),
        }),
        points[0]
      )
    );

    // 调整所有点到 SVG 视口坐标系
    const adjustedPoints = points.map((p) => ({
      x: p.x - bbox.x + LINE_PADDING,
      y: p.y - bbox.y + LINE_PADDING,
    }));

    // 生成路径
    const path = this.getPathFromPoints(adjustedPoints);

    this.data = {
      points,
      path,
      bbox,
    };
  }

  private getManhattanPoints(params: {
    source: IPoint;
    target: IPoint;
    vertical: boolean;
  }): IPoint[] {
    const { source, target, vertical } = params;
    const points: IPoint[] = [source];

    if (vertical) {
      // 垂直优先布局
      if (source.y !== target.y) {
        points.push({ x: source.x, y: target.y });
      }
      if (source.x !== target.x) {
        points.push({ x: target.x, y: target.y });
      }
    } else {
      // 水平优先布局
      if (source.x !== target.x) {
        points.push({ x: target.x, y: source.y });
      }
      if (source.y !== target.y) {
        points.push({ x: target.x, y: target.y });
      }
    }

    if (points[points.length - 1] !== target) {
      points.push(target);
    }

    return points;
  }

  private getPathFromPoints(points: IPoint[]): string {
    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  }
}
