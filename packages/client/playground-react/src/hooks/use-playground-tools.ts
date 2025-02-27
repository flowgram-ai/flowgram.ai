import { useCallback, useEffect, useState } from 'react';

import {
  EditorState,
  EditorStateConfigEntity,
  PlaygroundInteractiveType,
  useConfigEntity,
  usePlayground,
} from '@flowgram.ai/core';
import { DisposableCollection } from '@flowgram.ai/utils';

export interface PlaygroundToolsPropsType {
  /**
   * 最大缩放比，默认 2
   */
  maxZoom?: number;
  /**
   * 最小缩放比，默认 0.25
   */
  minZoom?: number;
}

export interface PlaygroundTools {
  /**
   * 缩放 zoom 大小比例
   */
  zoom: number;
  /**
   * 放大
   */
  zoomin: (easing?: boolean) => void;
  /**
   * 缩小
   */
  zoomout: (easing?: boolean) => void;
  /**
   * 设置缩放比例
   * @param zoom
   */
  updateZoom: (newZoom: number, easing?: boolean, easingDuration?: number) => void;
  /**
   * 当前的交互模式, 鼠标友好模式 和 触摸板模式
   */
  interactiveType: PlaygroundInteractiveType;
  /**
   * 切换交互模式
   */
  toggleIneractiveType: () => void;
}

export function usePlaygroundTools(props?: PlaygroundToolsPropsType): PlaygroundTools {
  const { maxZoom = 2, minZoom = 0.25 } = props || {};
  const playground = usePlayground();
  const editorState = useConfigEntity(EditorStateConfigEntity, true);

  const [zoom, setZoom] = useState(1);

  const handleZoomOut = useCallback(
    (easing?: boolean) => {
      if (zoom < minZoom) {
        return;
      }
      playground.config.zoomout(easing);
    },
    [zoom, playground, minZoom],
  );

  const handleZoomIn = useCallback(
    (easing?: boolean) => {
      if (zoom > maxZoom) {
        return;
      }
      playground.config.zoomin(easing);
    },
    [zoom, playground, maxZoom],
  );

  const handleUpdateZoom = useCallback(
    (value: number, easing?: boolean, easingDuration?: number) => {
      playground.config.updateZoom(value, easing, easingDuration);
    },
    [playground],
  );

  const handleToggleIneractiveType = useCallback(() => {
    if (editorState.isMouseFriendlyMode()) {
      editorState.changeState(EditorState.STATE_SELECT.id);
    } else {
      editorState.changeState(EditorState.STATE_MOUSE_FRIENDLY_SELECT.id);
    }
  }, [editorState]);

  useEffect(() => {
    const dispose = new DisposableCollection();
    dispose.push(playground.onZoom(z => setZoom(z)));
    return () => dispose.dispose();
  }, [playground]);

  return {
    zoomin: handleZoomIn,
    zoomout: handleZoomOut,
    updateZoom: handleUpdateZoom,
    zoom,
    interactiveType: editorState.isMouseFriendlyMode() ? 'MOUSE' : 'PAD',
    toggleIneractiveType: handleToggleIneractiveType,
  };
}
