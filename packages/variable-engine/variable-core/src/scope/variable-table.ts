import { Observable, Subject, merge, share, skip, switchMap } from 'rxjs';
import { Disposable, Emitter } from '@flowgram.ai/utils';
import { DisposableCollection } from '@flowgram.ai/utils';

import { subsToDisposable } from '../utils/toDisposable';
import { BaseVariableField } from '../ast/declaration/base-variable-field';
import { VariableDeclaration } from '../ast';

export class VariableTable implements Disposable {
  protected table: Map<string, VariableDeclaration> = new Map();

  protected onDataChangeEmitter = new Emitter<void>();

  protected variables$: Subject<VariableDeclaration[]> = new Subject<VariableDeclaration[]>();

  // 监听变量列表中的单个变量变化
  protected anyVariableChange$: Observable<VariableDeclaration> = this.variables$.pipe(
    switchMap(_variables =>
      merge(
        ..._variables.map(_v =>
          _v.value$.pipe<any>(
            // 跳过 BehaviorSubject 第一个
            skip(1),
          ),
        ),
      ),
    ),
    share(),
  );

  /**
   * 监听任意变量变化
   * @param observer 监听器，变量变化时会吐出值
   * @returns
   */
  onAnyVariableChange(observer: (changedVariable: VariableDeclaration) => void) {
    return subsToDisposable(this.anyVariableChange$.subscribe(observer));
  }

  /**
   * 列表或者任意变量变化
   * @param observer
   */
  onAnyChange(observer: () => void) {
    const disposables = new DisposableCollection();
    disposables.pushAll([this.onDataChange(observer), this.onAnyVariableChange(observer)]);
    return disposables;
  }

  public onDataChange = this.onDataChangeEmitter.event;

  protected _version: number = 0;

  fireChange() {
    this._version++;
    this.onDataChangeEmitter.fire();
    this.parentTable?.fireChange();
  }

  get version(): number {
    return this._version;
  }

  constructor(
    public parentTable?: VariableTable, // 父变量表，会包含所有子表的变量
  ) {}

  get variables(): VariableDeclaration[] {
    return Array.from(this.table.values());
  }

  get variableKeys(): string[] {
    return Array.from(this.table.keys());
  }

  /**
   * 根据 keyPath 找到对应的变量，或 Property 节点
   * @param keyPath
   * @returns
   */
  getByKeyPath(keyPath: string[]): BaseVariableField | undefined {
    const [variableKey, ...propertyKeys] = keyPath || [];

    if (!variableKey) {
      return;
    }

    const variable = this.getVariableByKey(variableKey);

    return propertyKeys.length ? variable?.getByKeyPath(propertyKeys) : variable;
  }

  /**
   * 根据 key 值找到相应的变量
   * @param key
   * @returns
   */
  getVariableByKey(key: string) {
    return this.table.get(key);
  }

  /**
   * 往 variableTable 添加输出变量
   * @param variable
   */
  addVariableToTable(variable: VariableDeclaration) {
    this.table.set(variable.key, variable);
    if (this.parentTable) {
      this.parentTable.addVariableToTable(variable);
    }
    this.variables$.next(this.variables);
  }

  /**
   * 从 variableTable 中移除变量
   * @param key
   */
  removeVariableFromTable(key: string) {
    this.table.delete(key);
    if (this.parentTable) {
      this.parentTable.removeVariableFromTable(key);
    }
    this.variables$.next(this.variables);
  }

  dispose(): void {
    this.variableKeys.forEach(_key => this.parentTable?.removeVariableFromTable(_key));
    this.onDataChangeEmitter.dispose();
  }
}
