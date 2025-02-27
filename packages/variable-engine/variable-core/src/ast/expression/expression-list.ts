import { ASTKind, ASTNodeJSON } from '../types';
import { ASTNode } from '../ast-node';

export interface ExpressionListJSON {
  expressions: ASTNodeJSON[];
}

export class ExpressionList extends ASTNode<ExpressionListJSON> {
  static kind: string = ASTKind.ExpressionList;

  expressions: ASTNode[];

  fromJSON({ expressions }: ExpressionListJSON): void {
    this.expressions = expressions.map((_expression, idx) => {
      const prevExpression = this.expressions[idx];

      if (prevExpression.kind !== _expression.kind) {
        prevExpression.dispose();
        this.fireChange();
        return this.createChildNode(_expression);
      }

      prevExpression.fromJSON(_expression);
      return prevExpression;
    });
  }

  toJSON(): ASTNodeJSON {
    return {
      kind: ASTKind.ExpressionList,
      properties: this.expressions.map(_expression => _expression.toJSON()),
    };
  }
}
