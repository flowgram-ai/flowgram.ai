import { VariableTable } from '../variable-table';
import { type Scope } from '../scope';
import { type VariableEngine } from '../../variable-engine';
import { createMemo } from '../../utils/memo';
import { type VariableDeclaration } from '../../ast';

/**
 * 作用域输出
 */
export class ScopeOutputData {
  protected variableTable: VariableTable;

  protected memo = createMemo();

  get variableEngine(): VariableEngine {
    return this.scope.variableEngine;
  }

  get globalVariableTable(): VariableTable {
    return this.scope.variableEngine.globalVariableTable;
  }

  get onDataChange() {
    return this.variableTable.onDataChange.bind(this.variableTable);
  }

  get onAnyVariableChange() {
    return this.variableTable.onAnyVariableChange.bind(this.variableTable);
  }

  protected _hasChanges = false;

  constructor(public readonly scope: Scope) {
    // 基于 globalVariableTable 设置子变量表
    this.variableTable = new VariableTable(scope.variableEngine.globalVariableTable);

    this.scope.toDispose.pushAll([
      // AST 根节点更新时，检查在这次 AST 变化期间节点是否有变化
      this.scope.ast.subscribe(() => {
        if (this._hasChanges) {
          this.memo.clear();
          this.notifyCoversChange();
          this.variableTable.fireChange();
          this._hasChanges = false;
        }
      }),
      this.variableTable,
    ]);
  }

  /**
   * 作用域输出变量
   */
  get variables(): VariableDeclaration[] {
    return this.memo('variables', () =>
      this.variableTable.variables.sort((a, b) => a.order - b.order),
    );
  }

  /**
   * 输出的变量 keys
   */
  get variableKeys(): string[] {
    return this.memo('variableKeys', () => this.variableTable.variableKeys);
  }

  addVariableToTable(variable: VariableDeclaration) {
    if (variable.scope !== this.scope) {
      throw Error('VariableDeclaration must be a ast node in scope');
    }

    this.variableTable.addVariableToTable(variable);
    this._hasChanges = true;
  }

  // 标记为发生了变化，用于变量排序变化的场景
  setHasChanges() {
    this._hasChanges = true;
  }

  removeVariableFromTable(key: string) {
    this.variableTable.removeVariableFromTable(key);
    this._hasChanges = true;
  }

  getVariableByKey(key: string) {
    return this.variableTable.getVariableByKey(key);
  }

  // 通知覆盖作用域更新可用变量
  notifyCoversChange(): void {
    this.scope.coverScopes.forEach(scope => scope.available.refresh());
  }
}
