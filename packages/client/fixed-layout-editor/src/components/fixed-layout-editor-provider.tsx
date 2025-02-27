import React, { useMemo, useCallback, forwardRef } from 'react';

import { interfaces } from 'inversify';
import { HistoryService } from '@flowgram.ai/history';
import {
  FlowDocument,
  createPluginContextDefault,
  PlaygroundReactProvider,
  ClipboardService,
  SelectionService,
} from '@flowgram.ai/editor';

import { FlowOperationService } from '../types';
import { createFixedLayoutPreset, FixedLayoutPluginContext, FixedLayoutProps } from '../preset';

export const FixedLayoutEditorProvider = forwardRef<FixedLayoutPluginContext, FixedLayoutProps>(
  function FixedLayoutEditorProvider(props: FixedLayoutProps, ref) {
    const { parentContainer, children, ...others } = props;
    const preset = useMemo(() => createFixedLayoutPreset(others), []);
    const customPluginContext = useCallback(
      (container: interfaces.Container) =>
        ({
          ...createPluginContextDefault(container),
          get document(): FlowDocument {
            return container.get<FlowDocument>(FlowDocument);
          },
          get operation(): FlowOperationService {
            return container.get<FlowOperationService>(FlowOperationService);
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
        } as FixedLayoutPluginContext),
      []
    );
    return (
      <PlaygroundReactProvider
        ref={ref}
        plugins={preset}
        customPluginContext={customPluginContext}
        parentContainer={parentContainer}
      >
        {children}
      </PlaygroundReactProvider>
    );
  }
);
