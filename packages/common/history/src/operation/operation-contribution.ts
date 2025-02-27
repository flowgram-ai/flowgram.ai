import { OperationRegistry } from './operation-registry';

export const OperationContribution = Symbol('OperationContribution');

export interface OperationContribution {
  registerOperationMeta?(operationRegistry: OperationRegistry): void;
}
