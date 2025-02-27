import React from 'react';

import { INodeEngineContext, NodeEngineContext } from '../../node';

export const NodeEngineReactContext = React.createContext<INodeEngineContext>(
  NodeEngineContext.DEFAULT_JSON,
);
