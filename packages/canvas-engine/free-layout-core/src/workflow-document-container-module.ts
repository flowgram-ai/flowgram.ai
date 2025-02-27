import { ContainerModule } from 'inversify';
import { FlowDocument, FlowDocumentContribution } from '@flowgram.ai/document';
import { bindContributions } from '@flowgram.ai/utils';

import { WorkflowLinesManager } from './workflow-lines-manager';
import {
  WorkflowDocumentOptions,
  WorkflowDocumentOptionsDefault,
} from './workflow-document-option';
import { WorkflowDocumentContribution } from './workflow-document-contribution';
import { WorkflowDocument, WorkflowDocumentProvider } from './workflow-document';
import { getUrlParams } from './utils/get-url-params';
import { URLParams } from './typings';
import {
  WorkflowDragService,
  WorkflowHoverService,
  WorkflowSelectService,
  WorkflowResetLayoutService,
} from './service';
import { FreeLayout } from './layout';

export const WorkflowDocumentContainerModule = new ContainerModule(
  (bind, unbind, isBound, rebind) => {
    bind(WorkflowDocument).toSelf().inSingletonScope();
    bind(WorkflowLinesManager).toSelf().inSingletonScope();
    bind(FreeLayout).toSelf().inSingletonScope();
    bind(WorkflowDragService).toSelf().inSingletonScope();
    bind(WorkflowSelectService).toSelf().inSingletonScope();
    bind(WorkflowHoverService).toSelf().inSingletonScope();
    bind(WorkflowResetLayoutService).toSelf().inSingletonScope();
    bind(URLParams)
      .toDynamicValue(() => getUrlParams())
      .inSingletonScope();
    bindContributions(bind, WorkflowDocumentContribution, [FlowDocumentContribution]);
    bind(WorkflowDocumentOptions).toConstantValue({
      ...WorkflowDocumentOptionsDefault,
    });
    rebind(FlowDocument).toService(WorkflowDocument);
    bind(WorkflowDocumentProvider)
      .toDynamicValue(ctx => () => ctx.container.get(WorkflowDocument))
      .inSingletonScope();
  },
);
