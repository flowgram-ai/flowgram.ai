import { ASTKind } from './types';
import { MapJSON } from './type/map';
import { ArrayJSON } from './type/array';
import { ObjectJSON, UnionJSON } from './type';
import { EnumerateExpressionJSON, KeyPathExpressionJSON } from './expression';
import { PropertyJSON, VariableDeclarationJSON, VariableDeclarationListJSON } from './declaration';

export namespace ASTFactory {
  /**
   * 类型相关
   * @returns
   */
  export const createString = () => ({ kind: ASTKind.String });
  export const createNumber = () => ({ kind: ASTKind.Number });
  export const createBoolean = () => ({ kind: ASTKind.Boolean });
  export const createInteger = () => ({ kind: ASTKind.Integer });
  export const createObject = (json: ObjectJSON) => ({
    kind: ASTKind.Object,
    ...json,
  });
  export const createArray = (json: ArrayJSON) => ({
    kind: ASTKind.Array,
    ...json,
  });
  export const createMap = (json: MapJSON) => ({
    kind: ASTKind.Map,
    ...json,
  });
  export const createUnion = (json: UnionJSON) => ({
    kind: ASTKind.Union,
    ...json,
  });

  /**
   * 声明相关
   */
  export const createVariableDeclaration = <VariableMeta = any>(
    json: VariableDeclarationJSON<VariableMeta>,
  ) => ({
    kind: ASTKind.VariableDeclaration,
    ...json,
  });
  export const createProperty = <VariableMeta = any>(json: PropertyJSON<VariableMeta>) => ({
    kind: ASTKind.Property,
    ...json,
  });
  export const createVariableDeclarationList = (json: VariableDeclarationListJSON) => ({
    kind: ASTKind.VariableDeclarationList,
    ...json,
  });

  /**
   * 表达式相关
   */
  export const createEnumerateExpression = (json: EnumerateExpressionJSON) => ({
    kind: ASTKind.EnumerateExpression,
    ...json,
  });
  export const createKeyPathExpression = (json: KeyPathExpressionJSON) => ({
    kind: ASTKind.KeyPathExpression,
    ...json,
  });
}
