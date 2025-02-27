import { useService, PluginContext } from '@flowgram.ai/editor';

import { FreeLayoutPluginContext } from '../preset';

export function useClientContext(): FreeLayoutPluginContext {
  return useService<FreeLayoutPluginContext>(PluginContext);
}
