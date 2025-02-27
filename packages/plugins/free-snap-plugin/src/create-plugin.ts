import { definePluginCreator } from '@flowgram.ai/core';

import {
  FreeSnapPluginOptions,
  WorkflowSnapLayerOptions,
  WorkflowSnapServiceOptions,
} from './type';
import { WorkflowSnapService } from './service';
import { WorkflowSnapLayer } from './layer';
import { SnapDefaultOptions } from './constant';

export const createFreeSnapPlugin = definePluginCreator<FreeSnapPluginOptions>({
  onBind({ bind }) {
    bind(WorkflowSnapService).toSelf().inSingletonScope();
  },
  onInit(ctx, opts) {
    const options: WorkflowSnapServiceOptions & WorkflowSnapLayerOptions = {
      ...SnapDefaultOptions,
      ...opts,
    };
    ctx.playground.registerLayer(WorkflowSnapLayer, options);
    const snapService = ctx.get<WorkflowSnapService>(WorkflowSnapService);
    snapService.init(options);
  },
  onDispose(ctx) {
    const snapService = ctx.get<WorkflowSnapService>(WorkflowSnapService);
    snapService.dispose();
  },
});
