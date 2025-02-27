import { ASTKind } from '../types';
import { BaseVariableField, BaseVariableFieldJSON } from './base-variable-field';

export type PropertyJSON<VariableMeta = any> = BaseVariableFieldJSON<VariableMeta> & {
  // Key 为必填项
  key: string;
};

export class Property<VariableMeta = any> extends BaseVariableField<VariableMeta> {
  static kind: string = ASTKind.Property;
}
