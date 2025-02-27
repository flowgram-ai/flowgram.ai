import React, { useMemo, useCallback, forwardRef } from 'react';

import { interfaces } from 'inversify';
import { WorkflowDocument } from '@flowgram.ai/free-layout-core';
import { HistoryService } from '@flowgram.ai/free-history-plugin';
import {
  PlaygroundReactProvider,
  createPluginContextDefault,
  ClipboardService,
  SelectionService,
} from '@flowgram.ai/editor';

import { createFreeLayoutPreset, FreeLayoutPluginContext, FreeLayoutProps } from '../preset';

export const FreeLayoutEditorProvider = forwardRef<FreeLayoutPluginContext, FreeLayoutProps>(
  function FreeLayoutEditorProvider(props: FreeLayoutProps, ref) {
    const { children, ...others } = props;
    const preset = useMemo(() => createFreeLayoutPreset(others), []);
    const customPluginContext = useCallback(
      (container: interfaces.Container) =>
        ({
          ...createPluginContextDefault(container),
          get document(): WorkflowDocument {
            return container.get<WorkflowDocument>(WorkflowDocument);
          },
          get clipboard(): ClipboardService {
            return container.get<ClipboardService>(ClipboardService);
          },
          get selection(): SelectionService {
            return container.get<SelectionService>(SelectionService);
          },
          get history(): HistoryService {
            return container.get<HistoryService>(HistoryService);
          },
        } as FreeLayoutPluginContext),
      []
    );
    return (
      <PlaygroundReactProvider ref={ref} plugins={preset} customPluginContext={customPluginContext}>
        {children}
      </PlaygroundReactProvider>
    );
  }
);
