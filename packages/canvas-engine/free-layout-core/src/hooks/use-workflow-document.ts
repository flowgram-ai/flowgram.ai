import { useService } from '@flowgram.ai/core';

import { WorkflowDocument } from '../workflow-document';

export function useWorkflowDocument(): WorkflowDocument {
  return useService<WorkflowDocument>(WorkflowDocument);
}
