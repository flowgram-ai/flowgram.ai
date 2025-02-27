import { runFixedLayoutTest } from '../__mocks__/run-fixed-layout-test';

runFixedLayoutTest(
  'Variable Fix Layout Group',
  {
    nodes: [
      {
        id: 'start_0',
        type: 'start',
        blocks: [],
      },
      {
        id: '$group_test$',
        type: 'block',
        blocks: [
          {
            id: 'node_0',
            type: 'noop',
            blocks: [],
          },
          {
            id: 'node_1',
            type: 'noop',
            blocks: [],
          },
        ],
      },
      {
        id: 'end_0',
        type: 'end',
        blocks: [],
      },
    ],
  },
  {
    startNodeId: 'start',
  }
);
