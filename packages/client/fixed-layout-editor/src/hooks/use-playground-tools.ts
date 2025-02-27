import { useCallback, useEffect, useState } from 'react';

import { DisposableCollection } from '@flowgram.ai/utils';
import { HistoryService } from '@flowgram.ai/history';
import { FlowDocument, FlowLayoutDefault, FlowNodeRenderData } from '@flowgram.ai/editor';
import { usePlayground, usePlaygroundContainer, useService } from '@flowgram.ai/editor';

import { fitView } from '../utils/fit-view';

export interface PlaygroundToolsPropsType {
  /**
   * 最大缩放比，默认 2
   */
  maxZoom?: number;
  /**
   * 最小缩放比，默认 0.25
   */
  minZoom?: number;
  /**
   * fitView padding 边距，默认 30
   */
  padding?: number;
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
   * 自适应视区
   */
  fitView: (easing?: boolean) => void;
  /**
   * 是否垂直布局
   */
  isVertical: boolean;
  /**
   * 切换布局, 如果不传入则直接切换
   */
  changeLayout: (layout?: FlowLayoutDefault) => void;

  /**
   * 是否可 redo
   */
  canRedo: boolean;
  /**
   * 是否可 undo
   */
  canUndo: boolean;
  /**
   * redo
   */
  redo: () => void;
  /**
   * undo
   */
  undo: () => void;
}

export function usePlaygroundTools(props?: PlaygroundToolsPropsType): PlaygroundTools {
  const { maxZoom = 2, minZoom = 0.25, padding = 30 } = props || {};
  const playground = usePlayground();
  const container = usePlaygroundContainer();
  const historyService = container.isBound(HistoryService)
    ? container.get(HistoryService)
    : undefined;
  const doc = useService<FlowDocument>(FlowDocument);

  const [zoom, setZoom] = useState(1);
  const [currentLayout, updateLayout] = useState(doc.layout);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const fitViewOptions = {
    maxZoom,
    minZoom,
    padding,
  };

  const changeLayout = useCallback(
    (newLayout?: FlowLayoutDefault) => {
      const allNodes = doc.getAllNodes();
      newLayout =
        newLayout ||
        (doc.layout.name === FlowLayoutDefault.HORIZONTAL_FIXED_LAYOUT
          ? FlowLayoutDefault.VERTICAL_FIXED_LAYOUT
          : FlowLayoutDefault.HORIZONTAL_FIXED_LAYOUT);
      allNodes.map((node) => {
        const renderData = node.getData(FlowNodeRenderData);
        renderData.node.classList.add('gedit-transition-ease');
      });
      setTimeout(() => {
        fitView(doc, playground.config, {
          ...fitViewOptions,
          easingDuration: 300,
        });
      }, 10);
      setTimeout(() => {
        allNodes.map((node) => {
          const renderData = node.getData(FlowNodeRenderData);
          renderData.node.classList.remove('gedit-transition-ease');
        });
      }, 500);
      doc.setLayout(newLayout);
      updateLayout(doc.layout);
    },
    [doc, playground]
  );

  const handleZoomOut = useCallback(
    (easing?: boolean) => {
      if (zoom < minZoom) {
        return;
      }
      playground?.config.zoomout(easing);
    },
    [zoom, playground]
  );

  const handleZoomIn = useCallback(
    (easing?: boolean) => {
      if (zoom > maxZoom) {
        return;
      }
      playground?.config.zoomin(easing);
    },
    [zoom, playground]
  );

  // 获取合适视角
  const handleFitView = useCallback(
    (easing?: boolean, easingDuration?: number) => {
      fitView(doc, playground.config, {
        ...fitViewOptions,
        easing,
        easingDuration,
      });
    },
    [doc, playground]
  );

  const handleUpdateZoom = useCallback(
    (value: number, easing?: boolean, easingDuration?: number) => {
      playground.config.updateZoom(value, easing, easingDuration);
    },
    [playground]
  );

  const handleUndo = useCallback(() => historyService?.undo(), [historyService]);
  const handleRedo = useCallback(() => historyService?.redo(), [historyService]);

  useEffect(() => {
    const dispose = new DisposableCollection();
    if (playground) {
      dispose.push(playground.onZoom((z) => setZoom(z)));
    }
    if (historyService) {
      dispose.push(
        historyService.undoRedoService.onChange(() => {
          setCanUndo(historyService.canUndo());
          setCanRedo(historyService.canRedo());
        })
      );
    }
    return () => dispose.dispose();
  }, [playground, historyService]);

  return {
    zoomin: handleZoomIn,
    zoomout: handleZoomOut,
    fitView: handleFitView,
    updateZoom: handleUpdateZoom,
    zoom,
    isVertical: currentLayout.name === FlowLayoutDefault.VERTICAL_FIXED_LAYOUT,
    changeLayout,
    canRedo,
    canUndo,
    undo: handleUndo,
    redo: handleRedo,
  };
}
