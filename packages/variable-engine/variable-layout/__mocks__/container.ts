import { Container } from 'inversify';
import {
  ScopeChain,
  VariableContainerModule,
} from '@flowgram.ai/variable-core';
import { createPlaygroundContainer } from '@flowgram.ai/core';
import {
  FreeLayoutScopeChain,
  FixedLayoutScopeChain,
  FlowNodeVariableData,
  VariableLayoutConfig,
} from '../src';
import { EntityManager } from '@flowgram.ai/core';
import { VariableEngine } from '@flowgram.ai/variable-core';
import {
  FlowDocument,
  FlowDocumentContainerModule,
} from '@flowgram.ai/document';
import { WorkflowDocumentContainerModule, WorkflowLinesManager, WorkflowSimpleLineContribution } from '@flowgram.ai/free-layout-core';

export function getContainer(layout: 'free' | 'fixed', layoutConfig?: VariableLayoutConfig): Container {
  const container = createPlaygroundContainer() as Container;
  container.load(VariableContainerModule);
  container.load(FlowDocumentContainerModule);

  if (layout === 'free') {
    container.load(WorkflowDocumentContainerModule);
    container.get(WorkflowLinesManager).registerContribution(WorkflowSimpleLineContribution);
    container.get(WorkflowLinesManager).switchLineType(WorkflowSimpleLineContribution.type);
  }

  if (layoutConfig) {
    container.bind(VariableLayoutConfig).toConstantValue(layoutConfig);
  }
  if (layout === 'free') {
    container.bind(ScopeChain).to(FreeLayoutScopeChain).inSingletonScope();
  }
  if (layout === 'fixed') {
    container.bind(ScopeChain).to(FixedLayoutScopeChain).inSingletonScope();
  }

  const entityManager = container.get<EntityManager>(EntityManager);
  const variableEngine = container.get<VariableEngine>(VariableEngine);
  const document = container.get<FlowDocument>(FlowDocument);

  /**
   * 扩展 FlowNodeVariableData
   */
  entityManager.registerEntityData(
    FlowNodeVariableData,
    () => ({ variableEngine } as any),
  );
  document.registerNodeDatas(FlowNodeVariableData);

  return container;
}
