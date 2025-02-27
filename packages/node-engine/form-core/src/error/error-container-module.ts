import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram.ai/utils';

import { NodeContribution } from '../node';
import { ErrorNodeContribution } from './error-node-contribution';

export const ErrorContainerModule = new ContainerModule(bind => {
  bindContributions(bind, ErrorNodeContribution, [NodeContribution]);
});
