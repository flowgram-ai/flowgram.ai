import { WorkflowLinesManager } from '@flowgram.ai/free-layout-core';
import { definePluginCreator, PluginContext } from '@flowgram.ai/core';

import { FreeLinesPluginOptions } from './type';
import { WorkflowLinesLayer } from './layer';
import { WorkflowBezierLineContribution, WorkflowFoldLineContribution } from './contributions';

export const createFreeLinesPlugin = definePluginCreator({
  onInit: (ctx: PluginContext, opts: FreeLinesPluginOptions) => {
    ctx.playground.registerLayer(WorkflowLinesLayer, {
      ...opts,
      renderElement: () => {
        if (typeof opts.renderElement === 'function') {
          return opts.renderElement(ctx);
        } else {
          return opts.renderElement;
        }
      },
    });
  },
  onReady: (ctx: PluginContext, opts: FreeLinesPluginOptions) => {
    const linesManager = ctx.container.get(WorkflowLinesManager);
    linesManager
      .registerContribution(WorkflowBezierLineContribution)
      .registerContribution(WorkflowFoldLineContribution);

    if (opts.contributions) {
      opts.contributions.forEach((contribution) => {
        linesManager.registerContribution(contribution);
      });
    }

    if (opts.defaultLineType) {
      linesManager.switchLineType(opts.defaultLineType);
    }
  },
});
