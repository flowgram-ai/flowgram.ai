import { memo } from 'react';

import { LineSVG } from './line-svg';

export const WorkflowLineRender = memo(
  LineSVG,
  (prevProps, nextProps) => prevProps.version === nextProps.version
);
