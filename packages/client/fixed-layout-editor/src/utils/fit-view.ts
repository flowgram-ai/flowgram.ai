import {
  type FlowDocument,
  type PlaygroundConfigEntity,
  TransformData,
} from '@flowgram.ai/editor';
import { Rectangle, SizeSchema } from '@flowgram.ai/utils';

export interface CustomOptions {
  maxZoom: number;
  minZoom: number;
  padding: number;
  easing?: boolean;
  easingDuration?: number;
}

export const fitView = (
  doc: FlowDocument,
  playgroundConfig: PlaygroundConfigEntity,
  customOptions: CustomOptions,
) => {
  const { maxZoom, minZoom, padding, easing = true, easingDuration = 50 } = customOptions;
  const bounds = Rectangle.enlarge(
    doc.getAllNodes().map(node => node.getData<TransformData>(TransformData).bounds),
  ).pad(padding, padding); // 留出 padding 像素的边界

  // 这里不用使用缩放后的 viewport
  const viewport = playgroundConfig.getViewport(false);
  let zoom = SizeSchema.fixSize(bounds, viewport);

  if (zoom > maxZoom) {
    zoom = maxZoom;
  } else if (zoom < minZoom) {
    zoom = minZoom;
  }

  return playgroundConfig.scrollToView({
    bounds,
    zoom,
    easing,
    scrollToCenter: true,
    easingDuration,
  });
};
