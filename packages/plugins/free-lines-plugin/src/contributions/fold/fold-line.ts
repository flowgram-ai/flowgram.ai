import { type IPoint, Point, Rectangle } from '@flowgram.ai/utils';

/**
 * 计算点和直线的距离
 * @param p1
 * @param p2
 * @param p3
 */
function pointLineDistance(p1: IPoint, p2: IPoint, p3: IPoint): number {
  let len;

  // 竖着的线
  if (p1.x - p2.x === 0) {
    len = Math.abs(p3.x - p1.x);
  } else {
    const A = (p1.y - p2.y) / (p1.x - p2.x);
    const B = p1.y - A * p1.x;

    len = Math.abs((A * p3.x + B - p3.y) / Math.sqrt(A * A + 1));
  }

  return len;
}

export namespace FoldLine {
  const EDGE_RADIUS = 5;
  const OFFSET = 20;

  function getEdgeCenter({ source, target }: { source: IPoint; target: IPoint }): [number, number] {
    const xOffset = Math.abs(target.x - source.x) / 2;
    const centerX = target.x < source.x ? target.x + xOffset : target.x - xOffset;

    const yOffset = Math.abs(target.y - source.y) / 2;
    const centerY = target.y < source.y ? target.y + yOffset : target.y - yOffset;

    return [centerX, centerY];
  }

  const getDirection = ({ source, target }: { source: IPoint; target: IPoint }): IPoint =>
    source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };

  // eslint-disable-next-line complexity
  export function getPoints({
    source,
    target,
    vertical = false,
  }: {
    source: IPoint;
    target: IPoint;
    vertical?: boolean;
  }): IPoint[] {
    // from 节点的出发方向
    const sourceDir = vertical ? { x: 0, y: 1 } : { x: 1, y: 0 };
    // to 节点的接收方向
    const targetDir = vertical ? { x: 0, y: -1 } : { x: -1, y: 0 };
    const sourceGapped: IPoint = {
      x: source.x + sourceDir.x * OFFSET,
      y: source.y + sourceDir.y * OFFSET,
    };
    const targetGapped: IPoint = {
      x: target.x + targetDir.x * OFFSET,
      y: target.y + targetDir.y * OFFSET,
    };
    const dir = vertical
      ? { x: 0, y: sourceGapped.y < targetGapped.y ? 1 : -1 }
      : getDirection({ source: sourceGapped, target: targetGapped });
    const dirAccessor = dir.x !== 0 ? 'x' : 'y';
    const currDir = dir[dirAccessor];

    let points: IPoint[] = [];
    let centerX, centerY;

    const [defaultCenterX, defaultCenterY] = getEdgeCenter({
      source,
      target,
    });

    // 计算向量乘积
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
      centerX = defaultCenterX;
      centerY = defaultCenterY;

      const verticalSplit: IPoint[] = [
        { x: centerX, y: sourceGapped.y },
        { x: centerX, y: targetGapped.y },
      ];

      const horizontalSplit: IPoint[] = [
        { x: sourceGapped.x, y: centerY },
        { x: targetGapped.x, y: centerY },
      ];

      if (sourceDir[dirAccessor] === currDir) {
        points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
      } else {
        points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
      }
    } else {
      // sourceTarget means we take x from source and y from target, targetSource is the opposite
      const sourceTarget: IPoint[] = [{ x: sourceGapped.x, y: targetGapped.y }];
      const targetSource: IPoint[] = [{ x: targetGapped.x, y: sourceGapped.y }];
      // this handles edges with same handle positions
      if (dirAccessor === 'x') {
        points = sourceDir.x === currDir ? targetSource : sourceTarget;
      } else {
        points = sourceDir.y === currDir ? sourceTarget : targetSource;
      }

      // these are conditions for handling mixed handle positions like Right -> Bottom for example
      const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo =
        sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo =
        sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 &&
          ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 &&
          ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === 'x' ? sourceTarget : targetSource;
      }

      const sourceGapPoint = { x: sourceGapped.x, y: sourceGapped.y };
      const targetGapPoint = { x: targetGapped.x, y: targetGapped.y };
      const maxXDistance = Math.max(
        Math.abs(sourceGapPoint.x - points[0].x),
        Math.abs(targetGapPoint.x - points[0].x)
      );
      const maxYDistance = Math.max(
        Math.abs(sourceGapPoint.y - points[0].y),
        Math.abs(targetGapPoint.y - points[0].y)
      );

      if (maxXDistance >= maxYDistance) {
        centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
        centerY = points[0].y;
      } else {
        centerX = points[0].x;
        centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
      }
    }

    const pathPoints = [
      source,
      { x: sourceGapped.x, y: sourceGapped.y },
      ...points,
      { x: targetGapped.x, y: targetGapped.y },
      target,
    ];

    return pathPoints;
  }

  function getBend(a: IPoint, b: IPoint, c: IPoint): string {
    const bendSize = Math.min(
      Point.getDistance(a, b) / 2,
      Point.getDistance(b, c) / 2,
      EDGE_RADIUS
    );
    const { x, y } = b;

    // no bend
    if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
      return `L${x} ${y}`;
    }

    // first segment is horizontal
    if (a.y === y) {
      const xDir = a.x < c.x ? -1 : 1;
      const yDir = a.y < c.y ? 1 : -1;
      return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
    }

    const xDir = a.x < c.x ? 1 : -1;
    const yDir = a.y < c.y ? -1 : 1;
    return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
  }

  /**
   * 实现 reactFlow 原本的折叠线交互
   */
  export function getSmoothStepPath(points: IPoint[]): string {
    const path = points.reduce<string>((res, p, i) => {
      let segment = '';

      if (i > 0 && i < points.length - 1) {
        segment = getBend(points[i - 1], p, points[i + 1]);
      } else {
        segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
      }

      res += segment;

      return res;
    }, '');

    return path;
  }
  export function getBounds(points: IPoint[]): Rectangle {
    const xList = points.map((p) => p.x);
    const yList = points.map((p) => p.y);
    const left = Math.min(...xList);
    const right = Math.max(...xList);
    const top = Math.min(...yList);
    const bottom = Math.max(...yList);
    return Rectangle.createRectangleWithTwoPoints(
      {
        x: left,
        y: top,
      },
      {
        x: right,
        y: bottom,
      }
    );
  }
  /**
   * 折叠线和点的距离
   * @param linePosition
   * @param pos
   */
  export function getFoldLineToPointDistance(points: IPoint[], pos: IPoint): number {
    const bounds = getBounds(points);
    if (bounds.contains(pos.x, pos.y)) {
      const lines = points.reduce((res, point, index) => {
        if (index === 0) {
          return res;
        }
        res.push([points[index - 1]!, point]);
        return res;
      }, [] as [IPoint, IPoint][]);
      return Math.min(...lines.map((l) => pointLineDistance(...l, pos)));
    }
    return Math.min(...points.map((p) => Point.getDistance(p, pos)));
  }
}
