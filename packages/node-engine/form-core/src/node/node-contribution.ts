import { type NodeManager } from './node-manager';

export const NodeContribution = Symbol('NodeContribution');

export interface NodeContribution {
  onRegister?(nodeManager: NodeManager): void;
}
