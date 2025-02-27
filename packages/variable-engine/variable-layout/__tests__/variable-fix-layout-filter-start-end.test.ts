import { FlowNodeScope } from '../src/types';
import { runFixedLayoutTest } from '../__mocks__/run-fixed-layout-test';
import { fixLayout1 } from '../__mocks__/fixed-layout-specs';

const filterStart = (_scope: FlowNodeScope) => !['start'].includes(_scope.meta?.node?.id || '');

const filterEnd = (_scope: FlowNodeScope) => !['end'].includes(_scope.meta?.node?.id || '');

runFixedLayoutTest('Variable Fix Layout Filter Start End', fixLayout1, {
  startNodeId: 'start',
  transformCovers: scopes => scopes.filter(filterEnd),
  transformDeps: scopes => scopes.filter(filterStart),
});
