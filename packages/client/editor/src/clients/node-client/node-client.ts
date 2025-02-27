import { injectable, inject } from 'inversify';

import { NodeFocusService } from './node-focus-service';

@injectable()
export class NodeClient {
  @inject(NodeFocusService) nodeFocusService: NodeFocusService;
}
