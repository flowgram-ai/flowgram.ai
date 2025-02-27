import { useCallback } from 'react';

import { PositionSchema } from '@flowgram.ai/utils';
import {
  fitView,
  usePlayground,
  usePlaygroundContainer,
  useService,
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram.ai/free-layout-core';
import { FreeOperationType, HistoryService } from '@flowgram.ai/free-history-plugin';
import { AutoLayoutService, LayoutOptions } from '@flowgram.ai/free-auto-layout-plugin';
import { TransformData } from '@flowgram.ai/editor';

type AutoLayoutResetFn = () => void;

type AutoLayoutFn = (options?: LayoutOptions) => Promise<AutoLayoutResetFn>;

type UseAutoLayout = () => AutoLayoutFn;

const getNodePosition = (node: WorkflowNodeEntity): PositionSchema => {
  const transform = node.getData(TransformData);
  return {
    x: transform.position.x,
    y: transform.position.y,
  };
};

const useHistoryService = () => {
  const container = usePlaygroundContainer();
  try {
    return container.get(HistoryService);
  } catch (e) {
    return {
      pushOperation: () => {},
    } as unknown as HistoryService;
  }
};

const useUpdateHistory = () => {
  const historyService = useHistoryService();
  const update = useCallback(
    (params: {
      nodes: WorkflowNodeEntity[];
      startPositions: PositionSchema[];
      endPositions: PositionSchema[];
    }) => {
      const { nodes, startPositions: oldValue, endPositions: value } = params;
      const ids = nodes.map((node) => node.id);
      historyService.pushOperation(
        {
          type: FreeOperationType.dragNodes,
          value: {
            ids,
            value,
            oldValue,
          },
        },
        {
          noApply: true,
        }
      );
    },
    [historyService]
  );
  return update;
};

const createResetFn = (params: {
  nodes: WorkflowNodeEntity[];
  startPositions: PositionSchema[];
}): AutoLayoutResetFn => {
  const { nodes, startPositions } = params;
  return () => {
    nodes.forEach((node, index) => {
      const transform = node.getData(TransformData);
      const position = startPositions[index];
      transform.update({
        position,
      });
    });
  };
};

const useApplyLayout: UseAutoLayout = () => {
  const document = useService(WorkflowDocument);
  const autoLayoutService = useService<AutoLayoutService>(AutoLayoutService);
  const updateHistory = useUpdateHistory();
  const handleAutoLayout: AutoLayoutFn = useCallback(
    async (options?: LayoutOptions): Promise<AutoLayoutResetFn> => {
      const nodes = document.getAllNodes();
      const startPositions = nodes.map(getNodePosition);
      await autoLayoutService.layout(options);
      const endPositions = nodes.map(getNodePosition);
      updateHistory({
        nodes,
        startPositions,
        endPositions,
      });
      return createResetFn({
        nodes,
        startPositions,
      });
    },
    [autoLayoutService, document, updateHistory]
  );
  return handleAutoLayout;
};

export const useAutoLayout: UseAutoLayout = () => {
  const document = useService(WorkflowDocument);
  const playground = usePlayground();
  const applyLayout = useApplyLayout();
  const handleFitView = useCallback(
    (easing?: boolean) => {
      fitView(document, playground.config, easing);
    },
    [document, playground]
  );
  const autoLayout: AutoLayoutFn = useCallback(
    async (options?: LayoutOptions): Promise<AutoLayoutResetFn> => {
      handleFitView();
      const resetFn: AutoLayoutResetFn = await applyLayout(options);
      handleFitView();
      return resetFn;
    },
    [applyLayout]
  );
  return autoLayout;
};
