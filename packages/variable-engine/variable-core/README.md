# 变量引擎

## 文件夹结构

```
- ast 可响应AST树实现
  - common 通用AST节点
  - declaration 声明AST节点
  - expression 表达式AST节点
  - type 类型AST节点
  - utils 工具函数
  - ast-node.ts 可响应式AST基类实现
  - ast-registers.ts AST节点注册器
- scope 作用域实现
  - datas 作用域内部的Data
    - scope-available-data.ts 作用域可用变量
    - scope-output-data.ts 作用域输出变量
  - scope-chain.ts 作用域链抽象实现
  - scope.ts 作用域实体
  - variable-table.ts 变量快速访问表
```

## Case Run Down

