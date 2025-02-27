export * from './workflow-json';
export * from './workflow-edge';
export * from './workflow-node';
export * from './workflow-registry';
export * from './workflow-line';
export * from './workflow-sub-canvas';

export const URLParams = Symbol('');

export interface URLParams {
  [key: string]: string;
}
