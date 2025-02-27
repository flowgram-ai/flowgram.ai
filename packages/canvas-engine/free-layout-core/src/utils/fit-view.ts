import { type PlaygroundConfigEntity, TransformData } from '@flowgram.ai/core';
import { Rectangle } from '@flowgram.ai/utils';

import { type WorkflowDocument } from '../workflow-document';

export const fitView = (
  doc: WorkflowDocument,
  playgroundConfig: PlaygroundConfigEntity,
  easing = true,
) => {
  const bounds = Rectangle.enlarge(
    doc.getAllNodes().map(node => node.getData<TransformData>(TransformData).bounds),
  );
  // 留出 30 像素的边界
  return playgroundConfig.fitView(bounds, easing, 30);
};
