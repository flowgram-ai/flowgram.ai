import React, { forwardRef } from 'react';

import { EditorRenderer } from '@flowgram.ai/editor';

import { FixedLayoutPluginContext, FixedLayoutProps } from '../preset';
import { FixedLayoutEditorProvider } from './fixed-layout-editor-provider';

/**
 * 固定布局编辑器
 * @param props
 * @constructor
 */
export const FixedLayoutEditor = forwardRef<FixedLayoutPluginContext, FixedLayoutProps>(
  function FixedLayoutEditor(props: FixedLayoutProps, ref) {
    const { children, ...otherProps } = props;
    return (
      <FixedLayoutEditorProvider ref={ref} {...otherProps}>
        <EditorRenderer>{children}</EditorRenderer>
      </FixedLayoutEditorProvider>
    );
  },
);
