import React from 'react';
import './index.less';

// https://github.com/web-infra-dev/rspress/issues/553
const FreeFeatureOverview = React.lazy(() =>
  import('@flowgram.ai/demo-free-layout').then((module) => ({
    default: module.DemoFreeLayout,
  }))
);

export { FreeFeatureOverview };
