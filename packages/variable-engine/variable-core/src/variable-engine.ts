import { Subject } from 'rxjs';
import { inject, injectable, interfaces, preDestroy } from 'inversify';
import { Disposable, DisposableCollection } from '@flowgram.ai/utils';
import { Emitter } from '@flowgram.ai/utils';

import { subsToDisposable } from './utils/toDisposable';
import { createMemo } from './utils/memo';
import { ScopeChangeAction } from './scope/types';
import { Scope, ScopeChain, VariableTable } from './scope';
import { ContainerProvider } from './providers';
import { ASTRegisters, type GlobalEventActionType } from './ast';

@injectable()
export class VariableEngine implements Disposable {
  protected toDispose = new DisposableCollection();

  protected memo = createMemo();

  protected scopeMap = new Map<string, Scope>();

  globalEvent$: Subject<GlobalEventActionType> = new Subject<GlobalEventActionType>();

  protected onScopeChangeEmitter = new Emitter<ScopeChangeAction>();

  public globalVariableTable = new VariableTable();

  public onScopeChange = this.onScopeChangeEmitter.event;

  // 获取 inversify container 容器
  @inject(ContainerProvider) private readonly containerProvider: ContainerProvider;

  get container(): interfaces.Container {
    return this.containerProvider();
  }

  constructor(
    @inject(ScopeChain) public readonly chain: ScopeChain, // 作用域依赖关系偏序集
    @inject(ASTRegisters) public readonly astRegisters: ASTRegisters, // AST 节点注册管理器
  ) {
    this.toDispose.pushAll([
      chain,
      Disposable.create(() => {
        // 清空所有作用域
        this.getAllScopes().forEach(scope => scope.dispose());
        this.globalVariableTable.dispose();
      }),
    ]);
  }

  @preDestroy()
  dispose(): void {
    this.toDispose.dispose();
  }

  // 根据 scopeId 找到作用域
  getScopeById(scopeId: string): Scope | undefined {
    return this.scopeMap.get(scopeId);
  }

  // 移除作用域
  removeScopeById(scopeId: string): void {
    this.getScopeById(scopeId)?.dispose();
  }

  // 获取 Scope，如果 Scope 存在且类型相同，则会直接使用
  createScope(id: string, meta?: Record<string, any>): Scope {
    let scope = this.getScopeById(id);

    if (!scope) {
      scope = new Scope({ variableEngine: this, meta, id });
      this.scopeMap.set(id, scope);
      this.onScopeChangeEmitter.fire({ type: 'add', scope: scope! });

      scope.toDispose.pushAll([
        scope.ast.subscribe(() => {
          this.onScopeChangeEmitter.fire({ type: 'update', scope: scope! });
        }),
        // 可用变量发生变化
        scope.available.onDataChange(() => {
          this.onScopeChangeEmitter.fire({ type: 'available', scope: scope! });
        }),
      ]);
      scope.onDispose(() => {
        this.scopeMap.delete(id);
        this.onScopeChangeEmitter.fire({ type: 'delete', scope: scope! });
      });
    }

    return scope;
  }

  // 获取系统中所有的作用域
  getAllScopes({
    sort,
  }: {
    // 是否排序
    sort?: boolean;
  } = {}): Scope[] {
    const allScopes = Array.from(this.scopeMap.values());

    // 是否进行排序
    if (sort) {
      const sortScopes = this.chain.sortAll();
      const remainScopes = new Set(allScopes);
      sortScopes.forEach(_scope => remainScopes.delete(_scope));

      return [...sortScopes, ...Array.from(remainScopes)];
    }

    // 数据拷贝一份
    return [...allScopes];
  }

  fireGlobalEvent(event: GlobalEventActionType) {
    this.globalEvent$.next(event);
  }

  onGlobalEvent<ActionType extends GlobalEventActionType = GlobalEventActionType>(
    type: ActionType['type'],
    observer: (action: ActionType) => void,
  ): Disposable {
    return subsToDisposable(
      this.globalEvent$.subscribe(_action => {
        if (_action.type === type) {
          observer(_action as ActionType);
        }
      }),
    );
  }
}
