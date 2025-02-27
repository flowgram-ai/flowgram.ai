export enum NodeOperationType {
  changeFormValues = 'changeFormValues',
}

export interface ChangeFormValuesOperationValue {
  id: string;
  path: string;
  value: unknown;
  oldValue: unknown;
}
