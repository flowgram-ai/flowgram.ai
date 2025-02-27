import {
  Observable,
  Subject,
  distinctUntilChanged,
  map,
  merge,
  share,
  skip,
  switchMap,
} from 'rxjs';
import { flatten } from 'lodash';
import { shallowEqual } from 'fast-equals';
import { Disposable } from '@flowgram.ai/utils';
import { Emitter } from '@flowgram.ai/utils';

import { VariableTable } from '../variable-table';
import { type Scope } from '../scope';
import { subsToDisposable } from '../../utils/toDisposable';
import { createMemo } from '../../utils/memo';
import { Property, VariableDeclaration } from '../../ast';
/**
 * 作用域可用变量
 */
export class ScopeAvailableData {
  protected memo = createMemo();

  get globalVariableTable(): VariableTable {
    return this.scope.variableEngine.globalVariableTable;
  }

  protected refresh$: Subject<void> = new Subject();

  protected _variables: VariableDeclaration[] = [];

  // 刷新可访问变量列表
  refresh(): void {
    // 销毁的作用域不用触发 refresh
    if (this.scope.disposed) {
      return;
    }
    this.refresh$.next();
  }

  /**
   * 监听
   */
  protected variables$: Observable<VariableDeclaration[]> = this.refresh$.pipe(
    // 输出变量是否 version 发生变化
    map(() => flatten(this.depScopes.map(scope => scope.output.variables || []))),
    // 变量列表浅比较
    distinctUntilChanged<VariableDeclaration[]>(shallowEqual),
    share(),
  );

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
   * 监听变量列表变化
   * @param observer
   * @returns
   */
  onVariableListChange(observer: (variables: VariableDeclaration[]) => void) {
    return subsToDisposable(this.variables$.subscribe(observer));
  }

  protected onDataChangeEmitter = new Emitter<VariableDeclaration[]>();

  /**
   * 监听变量列表变化 + 任意子变量变化
   */
  public onDataChange = this.onDataChangeEmitter.event;

  constructor(public readonly scope: Scope) {
    this.scope.toDispose.pushAll([
      this.onVariableListChange(_variables => {
        this._variables = _variables;
        this.memo.clear();
        this.onDataChangeEmitter.fire(this._variables);
      }),
      this.onAnyVariableChange(() => {
        this.onDataChangeEmitter.fire(this._variables);
      }),
      Disposable.create(() => {
        this.refresh$.complete();
        this.refresh$.unsubscribe();
      }),
    ]);
  }

  /**
   * 获取可消费变量
   */
  get variables(): VariableDeclaration[] {
    return this._variables;
  }

  /**
   * 获取可访问的变量 keys
   */
  get variableKeys(): string[] {
    return this.memo('availableKeys', () => this._variables.map(_v => _v.key));
  }

  /**
   * 返回依赖的作用域
   */
  get depScopes(): Scope[] {
    return this.scope.depScopes;
  }

  /**
   * 通过 keyPath 找到可用变量
   * @param keyPath
   * @returns
   */
  getByKeyPath(keyPath: string[] = []): VariableDeclaration | Property | undefined {
    // 检查变量是否在可访问范围内
    if (!this.variableKeys.includes(keyPath[0])) {
      return;
    }
    return this.globalVariableTable.getByKeyPath(keyPath);
  }
}
