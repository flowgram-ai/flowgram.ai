import { runFixedLayoutTest } from '../__mocks__/run-fixed-layout-test';
import { fixLayout1 } from '../__mocks__/fixed-layout-specs';

runFixedLayoutTest('Variable Fix Layout', fixLayout1, {
  startNodeId: 'start',
  isNodeChildrenPrivate: node =>
    // 只有循环是 private
    node.flowNodeType === 'loop',
});
