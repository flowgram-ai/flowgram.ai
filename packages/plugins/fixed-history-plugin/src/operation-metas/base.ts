import { FlowOperation, FlowOperationBaseService } from '@flowgram.ai/document';
import { PluginContext } from '@flowgram.ai/core';
import { OperationMeta } from '@flowgram.ai/history';

import { FixedHistoryOperationService } from '../services';

export const baseOperationMeta: Pick<OperationMeta, 'apply'> = {
  apply: (operation, ctx: PluginContext) => {
    const fixedHistoryOperationService = ctx.get(
      FlowOperationBaseService,
    ) as FixedHistoryOperationService;

    return fixedHistoryOperationService.originApply(operation as FlowOperation);
  },
};
