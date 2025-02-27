import { inject, injectable } from 'inversify';
import {
  WorkflowDocument,
  WorkflowNodeEntity,
  WorkflowNodeLinesData,
} from '@flowgram.ai/free-layout-core';

import { Layout, type LayoutOptions } from './layout';

@injectable()
export class AutoLayoutService {
  @inject(WorkflowDocument) private readonly document: WorkflowDocument;

  public async layout(options: LayoutOptions = {}): Promise<void> {
    await this.layoutNode(this.document.root, options);
  }

  private async layoutNode(node: WorkflowNodeEntity, options: LayoutOptions): Promise<void> {
    // 获取子节点
    const nodes = node.collapsedChildren;
    if (!nodes || !Array.isArray(nodes) || !nodes.length) {
      return;
    }

    // 获取子线条
    const edges = node.collapsedChildren
      .map((child) => {
        const childLinesData = child.getData<WorkflowNodeLinesData>(WorkflowNodeLinesData);
        return childLinesData.outputLines.filter(Boolean);
      })
      .flat();

    // 先递归执行子节点 autoLayout
    await Promise.all(nodes.map(async (child) => this.layoutNode(child, options)));

    const layout = new Layout();
    layout.init({ nodes, edges }, options);
    layout.layout();
    await layout.position();
  }
}
