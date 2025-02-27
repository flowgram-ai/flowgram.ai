import { injectable } from 'inversify';

import { NodeContribution, NodeManager, PLUGIN_KEY } from '../node';
import { formPluginRender } from './form-render';

@injectable()
export class FormNodeContribution implements NodeContribution {
  onRegister(nodeManager: NodeManager) {
    nodeManager.registerPluginRender(PLUGIN_KEY.FORM, formPluginRender);
  }
}
