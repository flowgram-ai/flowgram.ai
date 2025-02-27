import { type Scope } from './scope';

// 获取所有作用域的参数
export interface GetAllScopeParams {
  // 是否排序
  sort?: boolean;
}

export interface ScopeChangeAction {
  type: 'add' | 'delete' | 'update' | 'available';
  scope: Scope;
}
