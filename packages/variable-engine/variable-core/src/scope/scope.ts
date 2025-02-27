import { DisposableCollection } from '@flowgram.ai/utils';

import { type VariableEngine } from '../variable-engine';
import { createMemo } from '../utils/memo';
import { ASTKind, MapNode } from '../ast';
import { ScopeAvailableData, ScopeEventData, ScopeOutputData } from './datas';

export class Scope<ScopeMeta extends Record<string, any> = Record<string, any>> {
  /**
   * Scope 唯一索引
   */
  readonly id: string;

  /**
   * Scope 依赖变量引擎
   */
  readonly variableEngine: VariableEngine;

  /**
   * 作用域的基本元信息，包括作用域所在节点及一些 flag 信息，上层业务可以额外扩展
   */
  readonly meta: ScopeMeta;

  /**
   * 作用域 AST 根节点
   * - Map<formItemKey, formItemValue>
   */
  readonly ast: MapNode;

  /**
   * 可用变量数据管理
   */
  readonly available: ScopeAvailableData;

  /**
   * 输出变量数据管理
   */
  readonly output: ScopeOutputData;

  /**
   * 作用域事件管理
   */
  readonly event: ScopeEventData;

  /**
   * 数据缓存
   */
  protected memo = createMemo();

  public toDispose: DisposableCollection = new DisposableCollection();

  constructor(options: { id: string; variableEngine: VariableEngine; meta?: ScopeMeta }) {
    this.id = options.id;
    this.meta = options.meta || ({} as any);
    this.variableEngine = options.variableEngine;

    this.event = new ScopeEventData(this);

    this.ast = this.variableEngine.astRegisters.createAST(
      {
        kind: ASTKind.MapNode,
        key: this.id,
      },
      {
        scope: this,
      },
    ) as MapNode;

    this.output = new ScopeOutputData(this);
    this.available = new ScopeAvailableData(this);
  }

  refreshCovers(): void {
    this.memo.clear('covers');
  }

  refreshDeps(): void {
    this.memo.clear('deps');
    this.available.refresh();
  }

  get depScopes(): Scope[] {
    return this.memo('deps', () =>
      this.variableEngine.chain
        .getDeps(this)
        .filter(_scope => Boolean(_scope) && !_scope?.disposed),
    );
  }

  get coverScopes(): Scope[] {
    return this.memo('covers', () =>
      this.variableEngine.chain
        .getCovers(this)
        .filter(_scope => Boolean(_scope) && !_scope?.disposed),
    );
  }

  dispose(): void {
    this.ast.dispose();
    this.toDispose.dispose();

    // 删除作用域时，触发上下游作用域依赖覆盖更新
    this.coverScopes.forEach(_scope => _scope.refreshDeps());
    this.depScopes.forEach(_scope => _scope.refreshCovers());
  }

  onDispose = this.toDispose.onDispose;

  get disposed(): boolean {
    return this.toDispose.disposed;
  }
}
