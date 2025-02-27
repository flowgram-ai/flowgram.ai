import { ASTKind } from '../types';
import { ASTNodeFlags } from '../flags';
import { BaseType } from './base-type';

export class StringType extends BaseType {
  public flags: ASTNodeFlags = ASTNodeFlags.BasicType;

  static kind: string = ASTKind.String;

  fromJSON(): void {
    // noop
  }
}
