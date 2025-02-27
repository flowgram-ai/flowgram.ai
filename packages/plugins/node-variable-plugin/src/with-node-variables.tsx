import React from 'react';

import { NodeRenderHoc, type NodeRenderProps } from '@flowgram.ai/form-core';

import { PublicScopeProvider } from './components/PublicScopeProvider';

// eslint-disable-next-line react/display-name
export const withNodeVariables: NodeRenderHoc = (Component) => (props: NodeRenderProps) =>
  (
    <PublicScopeProvider>
      <Component {...props} />
    </PublicScopeProvider>
  );
