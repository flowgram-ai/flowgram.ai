import { FlowDragLayer } from '@flowgram.ai/renderer';
import { FlowNodeEntity } from '@flowgram.ai/document';
import { definePluginCreator, PluginContext } from '@flowgram.ai/core';

// import { SelectorBounds } from './selector-bounds';

export interface FixDragPluginOptions<CTX extends PluginContext = PluginContext> {
  enable?: boolean;
  onDrop?: (ctx: CTX, dropData: { dragNodes: FlowNodeEntity[]; dropNode: FlowNodeEntity }) => void;
  canDrop?: (
    ctx: CTX,
    dropData: { dragNodes: FlowNodeEntity[]; dropNode: FlowNodeEntity; isBranch?: boolean },
  ) => boolean;
}

export const createFixedDragPlugin = definePluginCreator<FixDragPluginOptions<any>>({
  onInit(ctx, opts): void {
    // 默认可用，所以强制判断 false
    if (opts.enable !== false) {
      ctx.playground.registerLayer(FlowDragLayer, {
        onDrop: opts.onDrop ? opts.onDrop.bind(null, ctx) : undefined,
        canDrop: opts.canDrop ? opts.canDrop.bind(null, ctx) : undefined,
      });
    }
  },
});
