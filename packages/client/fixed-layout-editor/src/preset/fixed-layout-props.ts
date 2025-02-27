import { SelectBoxPluginOptions } from '@flowgram.ai/select-box-plugin';
import { FixedHistoryPluginOptions, HistoryService } from '@flowgram.ai/fixed-history-plugin';
import { type FixDragPluginOptions } from '@flowgram.ai/fixed-drag-plugin';
import {
  ClipboardService,
  EditorPluginContext,
  EditorProps,
  FlowDocument,
  FlowDocumentJSON,
  FlowLayoutDefault,
  SelectionService,
} from '@flowgram.ai/editor';

import { FlowOperationService } from '../types';

export interface FixedLayoutPluginContext extends EditorPluginContext {
  document: FlowDocument;
  /**
   * 提供对画布节点相关操作方法, 并 支持 redo/undo
   */
  operation: FlowOperationService;
  clipboard: ClipboardService;
  selection: SelectionService;
  history: HistoryService;
}

/**
 * 固定布局配置
 */
export interface FixedLayoutProps extends EditorProps<FixedLayoutPluginContext, FlowDocumentJSON> {
  selectBox?: SelectBoxPluginOptions;
  dragdrop?: FixDragPluginOptions<FixedLayoutPluginContext>;
  history?: FixedHistoryPluginOptions<FixedLayoutPluginContext> & { disableShortcuts?: boolean };
  defaultLayout?: FlowLayoutDefault | string; // 默认布局
}

export namespace FixedLayoutProps {
  /**
   * 默认配置
   */
  export const DEFAULT: FixedLayoutProps = EditorProps.DEFAULT as FixedLayoutProps;
}
