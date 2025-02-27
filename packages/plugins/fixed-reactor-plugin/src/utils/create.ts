import { FlowNodeBaseType } from '@flowgram.ai/document';
import { type FlowNodeEntity } from '@flowgram.ai/document';
import { FlowNodeJSON } from '@flowgram.ai/document';

import { ReactorNodeType } from '../typings';

// Reactor 样例数据
// const mock = {
//   type: 'reactor',
//   id: 'reactor_parent',
//   blocks: [
//     {
//       id: 'port_LnSdK',
//       blocks: [{ type: 'reactor', id: 'reactor_child' }],
//     },
//     {
//       id: 'port_60X7U',
//     },
//     {
//       id: 'port_JWhcm',
//     },
//     {
//       id: 'port_scHWa',
//     },
//   ],
// };

/**
 * 创建 Reactor 子节点
 * - Reactor
 *  - ReactorBlockIcon
 *  - ReactorInlineBlocks
 *    - ReactorPort 1
 *        - ReactorPortIcon 1
 *          - ChildReactor 1
 *          - ChildReactor 2
 *    - ReactorPort 2
 *
 * 范例数据：
 * {
 *  type: 'reactor',
 *  id: 'reactor_parent',
 *  blocks: [
 *    {
 *      id: 'port_LnSdK',
 *      blocks: [{ type: 'reactor', id: 'reactor_child' }],
 *    },
 *    {
 *      id: 'port_60X7U',
 *    }
 *  ],
 * }
 *
 * @param node
 * @param json
 * @returns
 */
export const createReactorFromJSON = (
  node: FlowNodeEntity,
  json: FlowNodeJSON,
): FlowNodeEntity[] => {
  const { document } = node;

  const addedNodes: FlowNodeEntity[] = [];

  // 块列表开始节点，用来展示块的按钮
  const blockIconNode = document.addNode({
    id: `$reactorIcon$${node.id}`,
    type: FlowNodeBaseType.BLOCK_ICON,
    originParent: node,
    parent: node,
  });
  const inlineBlocksNode = document.addNode({
    id: `$reactorInlineBlocks$${node.id}`,
    type: ReactorNodeType.ReactorInlineBlocks,
    originParent: node,
    parent: node,
  });
  addedNodes.push(blockIconNode);
  addedNodes.push(inlineBlocksNode);

  const portJSONList = json.blocks || [];

  portJSONList.forEach(_portJSON => {
    const port = document.addNode({
      ..._portJSON,
      type: ReactorNodeType.ReactorPort,
      originParent: node,
      parent: inlineBlocksNode,
    });
    addedNodes.push(port);

    (_portJSON.blocks || []).forEach(_portChild => {
      document.addNode(
        {
          type: ReactorNodeType.Reactor,
          ..._portChild,
          parent: port,
        },
        addedNodes,
      );
    });
  });

  return addedNodes;
};
