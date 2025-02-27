import { ContainerModule } from 'inversify';

import { FlowRendererResizeObserver } from './flow-renderer-resize-observer';
import { FlowRendererRegistry } from './flow-renderer-registry';

export const FlowRendererContainerModule = new ContainerModule(bind => {
  bind(FlowRendererRegistry).toSelf().inSingletonScope();
  bind(FlowRendererResizeObserver).toSelf().inSingletonScope();
});
