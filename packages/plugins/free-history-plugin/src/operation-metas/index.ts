import { resetLayoutOperationMeta } from './reset-layout';
import { dragNodesOperationMeta } from './drag-nodes';
import { deleteNodeOperationMeta } from './delete-node';
import { deleteLineOperationMeta } from './delete-line';
import { changeNodeDataOperationMeta } from './change-node-data';
import { addNodeOperationMeta } from './add-node';
import { addLineOperationMeta } from './add-line';

export const operationMetas = [
  addLineOperationMeta,
  deleteLineOperationMeta,
  addNodeOperationMeta,
  deleteNodeOperationMeta,
  changeNodeDataOperationMeta,
  resetLayoutOperationMeta,
  dragNodesOperationMeta,
];
