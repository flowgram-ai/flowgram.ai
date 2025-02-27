import { nanoid } from 'nanoid';

import { FlowNodeRegistry } from '../../typings';
import iconEnd from '../../assets/icon-end.jpg';
import { formMeta } from './form-meta';

export const EndNodeRegistry: FlowNodeRegistry = {
  type: 'end',
  meta: {
    isNodeEnd: true, // Mark as end
    selectable: false, // End node cannot select
    copyDisable: true, // End node canot copy
  },
  info: {
    icon: iconEnd,
    description:
      'The final node of the workflow, used to return the result information after the workflow is run.',
  },
  /**
   * Render node via formMeta
   */
  formMeta,
  canAdd(ctx, from) {
    // You can only add to the last node of the branch
    return from.isLast;
  },
  canDelete(ctx, node) {
    return node.parent === ctx.document.root;
  },
  onAdd(ctx, from) {
    return {
      id: `end_${nanoid()}`,
      type: 'end',
      data: {
        title: 'End',
        outputs: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
            },
          },
        },
      },
    };
  },
};
