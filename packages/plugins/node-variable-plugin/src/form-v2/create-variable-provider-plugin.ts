import { DataEvent, defineFormPluginCreator } from '@flowgram.ai/node';

export const createVariableProviderPlugin = defineFormPluginCreator('VariableProviderPlugin', {
  onInit: (ctx, opts) => {
    // todo
    // console.log('>>> VariableProviderPlugin init', ctx, opts);
  },
  effect: {
    arr: [
      {
        event: DataEvent.onValueInitOrChange,
        effect: () => {
          // todo
          // console.log('>>> VariableProviderPlugin effect triggered');
        },
      },
    ],
  },
  onDispose: (ctx, opts) => {
    // todo
    // console.log('>>> VariableProviderPlugin dispose', ctx, opts);
  },
});
