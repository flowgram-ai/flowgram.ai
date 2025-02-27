import { useService, PluginContext } from '@flowgram.ai/editor';

import { FixedLayoutPluginContext } from '../preset';

export function useClientContext(): FixedLayoutPluginContext {
  return useService<FixedLayoutPluginContext>(PluginContext);
}
