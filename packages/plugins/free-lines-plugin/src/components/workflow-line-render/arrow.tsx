import React from 'react';

import { LINE_OFFSET } from '../../constants/lines';

export function ArrowRenderer({
  id,
  pos,
  reverseArrow,
  strokeWidth,
  vertical,
  hide,
}: {
  id: string;
  strokeWidth: number;
  reverseArrow: boolean;
  pos: {
    x: number;
    y: number;
  };
  vertical?: boolean;
  hide?: boolean;
}) {
  if (hide) {
    return null;
  }
  const arrowPath = vertical
    ? reverseArrow
      ? `M ${pos.x - LINE_OFFSET},${pos.y} L ${pos.x},${pos.y - LINE_OFFSET} L ${
          pos.x + LINE_OFFSET
        },${pos.y}`
      : `M ${pos.x - LINE_OFFSET},${pos.y - LINE_OFFSET} L ${pos.x},${pos.y} L ${
          pos.x + LINE_OFFSET
        },${pos.y - LINE_OFFSET}`
    : reverseArrow
    ? `M ${pos.x},${pos.y + LINE_OFFSET} L ${pos.x - LINE_OFFSET},${pos.y} L ${pos.x},${
        pos.y - LINE_OFFSET
      }`
    : `M ${pos.x - LINE_OFFSET},${pos.y - LINE_OFFSET} L ${pos.x},${pos.y} L ${
        pos.x - LINE_OFFSET
      },${pos.y + LINE_OFFSET}`;

  return (
    <path
      d={arrowPath}
      strokeLinecap="round"
      stroke={`url(#${id})`}
      fill="none"
      strokeWidth={strokeWidth}
    />
  );
}
