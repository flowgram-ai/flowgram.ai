import type { FlowRendererRegistry } from './flow-renderer-registry';

export const FlowRendererContribution = Symbol('FlowRendererContribution');

export interface FlowRendererContribution {
  registerRenderer?(registry: FlowRendererRegistry): void;
}
