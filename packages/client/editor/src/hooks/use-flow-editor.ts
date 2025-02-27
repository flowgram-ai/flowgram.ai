import { useService } from '@flowgram.ai/core';

import { FlowEditorClient } from '../clients';

export function useFlowEditor(): FlowEditorClient {
  return useService(FlowEditorClient);
}
