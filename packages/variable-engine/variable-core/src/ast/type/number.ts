import { ASTKind } from '../types';
import { BaseType } from './base-type';

export class NumberType extends BaseType {
  static kind: string = ASTKind.Number;

  fromJSON(): void {
    // noop
  }
}
