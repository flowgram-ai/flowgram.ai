import { ContainerModule } from 'inversify';

import { NodeManager } from './node-manager';
import { NodeEngineContext } from './node-engine-context';
import { NodeEngine } from './node-engine';

export const NodeContainerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(NodeEngine).toSelf().inSingletonScope();
  bind(NodeManager).toSelf().inSingletonScope();
  bind(NodeEngineContext).toSelf().inSingletonScope();
});
