import { nanoid } from 'nanoid';
import { inject, injectable } from 'inversify';
import { Rectangle } from '@flowgram.ai/utils';
import { EntityManager } from '@flowgram.ai/core';

import { FlowNodeBaseType, FlowOperationBaseService, OperationType } from '../typings';
import { FlowNodeEntity } from '../entities';
import { FlowNodeRenderData, FlowNodeTransformData } from '../datas';

@injectable()
/** 分组服务 */
export class FlowGroupService {
  @inject(EntityManager) public readonly entityManager: EntityManager;

  @inject(FlowOperationBaseService)
  public readonly operationService: FlowOperationBaseService;

  /** 创建分组节点 */
  public createGroup(nodes: FlowNodeEntity[]): FlowNodeEntity | undefined {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return;
    }
    if (!FlowGroupController.validate(nodes)) {
      return;
    }
    const sortedNodes: FlowNodeEntity[] = nodes.sort((a, b) => a.index - b.index);
    const fromNode = sortedNodes[0];
    const groupId = `group_${nanoid(5)}`;
    this.operationService.apply({
      type: OperationType.createGroup,
      value: {
        targetId: fromNode.id,
        groupId,
        nodeIds: nodes.map((node) => node.id),
      },
    });
    const groupNode = this.entityManager.getEntityById<FlowNodeEntity>(groupId);
    if (!groupNode) {
      return;
    }
    const group = this.groupController(groupNode);
    if (!group) {
      return;
    }
    group.expand();
    return groupNode;
  }

  /** 删除分组 */
  public deleteGroup(groupNode: FlowNodeEntity): void {
    const json = groupNode.toJSON();
    if (!groupNode.pre || !json) {
      return;
    }
    this.operationService.apply({
      type: OperationType.deleteNodes,
      value: {
        fromId: groupNode.pre.id,
        nodes: [json],
      },
    });
  }

  /** 取消分组 */
  public ungroup(groupNode: FlowNodeEntity): void {
    const group = this.groupController(groupNode);
    if (!group) {
      return;
    }
    const nodes = group.nodes;
    if (!groupNode.pre) {
      return;
    }
    group.collapse();
    this.operationService.apply({
      type: OperationType.ungroup,
      value: {
        groupId: groupNode.id,
        targetId: groupNode.pre.id,
        nodeIds: nodes.map((node) => node.id),
      },
    });
  }

  /** 返回所有分组节点 */
  public getAllGroups(): FlowGroupController[] {
    const allNodes = this.entityManager.getEntities<FlowNodeEntity>(FlowNodeEntity);
    const groupNodes = allNodes.filter((node) => node.flowNodeType === FlowNodeBaseType.GROUP);
    return groupNodes
      .map((node) => this.groupController(node))
      .filter(Boolean) as FlowGroupController[];
  }

  /** 获取分组控制器*/
  public groupController(group: FlowNodeEntity): FlowGroupController | undefined {
    return FlowGroupController.create(group);
  }

  public static validate(nodes: FlowNodeEntity[]): boolean {
    return FlowGroupController.validate(nodes);
  }
}

/** 分组控制器 */
export class FlowGroupController {
  private constructor(public readonly groupNode: FlowNodeEntity) {}

  public get nodes(): FlowNodeEntity[] {
    return this.groupNode.collapsedChildren || [];
  }

  public get collapsed(): boolean {
    const groupTransformData = this.groupNode.getData<FlowNodeTransformData>(FlowNodeTransformData);
    return groupTransformData.collapsed;
  }

  public collapse(): void {
    this.collapsed = true;
  }

  public expand(): void {
    this.collapsed = false;
  }

  /** 获取分组外围的最大边框 */
  public get bounds(): Rectangle {
    const groupNodeBounds =
      this.groupNode.getData<FlowNodeTransformData>(FlowNodeTransformData).bounds;
    return groupNodeBounds;
  }

  /** 是否是开始节点 */
  public isStartNode(node?: FlowNodeEntity): boolean {
    if (!node) {
      return false;
    }
    const nodes = this.nodes;
    if (!nodes[0]) {
      return false;
    }
    return node.id === nodes[0].id;
  }

  /** 是否是结束节点 */
  public isEndNode(node?: FlowNodeEntity): boolean {
    if (!node) {
      return false;
    }
    const nodes = this.nodes;
    if (!nodes[nodes.length - 1]) {
      return false;
    }
    return node.id === nodes[nodes.length - 1].id;
  }

  public set note(note: string) {
    this.groupNode.getNodeMeta().note = note;
  }

  public get note(): string {
    return this.groupNode.getNodeMeta().note || '';
  }

  public set noteHeight(height: number) {
    this.groupNode.getNodeMeta().noteHeight = height;
  }

  public get noteHeight(): number {
    return this.groupNode.getNodeMeta().noteHeight || 0;
  }

  public get positionConfig(): Record<string, number> {
    return this.groupNode.getNodeMeta().positionConfig;
  }

  private set collapsed(collapsed: boolean) {
    const groupTransformData = this.groupNode.getData<FlowNodeTransformData>(FlowNodeTransformData);
    groupTransformData.collapsed = collapsed;
    groupTransformData.localDirty = true;
    if (groupTransformData.parent) groupTransformData.parent.localDirty = true;
    if (groupTransformData.parent?.firstChild)
      groupTransformData.parent.firstChild.localDirty = true;
  }

  public set hovered(hovered: boolean) {
    const groupRenderData = this.groupNode.getData<FlowNodeRenderData>(FlowNodeRenderData);
    if (hovered) {
      groupRenderData.toggleMouseEnter();
    } else {
      groupRenderData.toggleMouseLeave();
    }
    if (groupRenderData.hovered === hovered) {
      return;
    }
    groupRenderData.hovered = hovered;
  }

  public get hovered(): boolean {
    const groupRenderData = this.groupNode.getData<FlowNodeRenderData>(FlowNodeRenderData);
    return groupRenderData.hovered;
  }

  public static create(groupNode?: FlowNodeEntity): FlowGroupController | undefined {
    if (!groupNode) {
      return;
    }
    if (!FlowGroupController.isGroupNode(groupNode)) {
      return;
    }
    return new FlowGroupController(groupNode);
  }

  /** 判断节点能否组成分组 */
  public static validate(nodes: FlowNodeEntity[]): boolean {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      // 参数不合法
      return false;
    }

    // 判断是否有分组节点
    const isGroupRelatedNode = nodes.some((node) => FlowGroupController.isGroupNode(node));
    if (isGroupRelatedNode) return false;

    // 判断是否有节点已经处于分组中
    const hasGroup = nodes.some((node) => node && this.isNodeInGroup(node));
    if (hasGroup) return false;

    // 判断是否来自同一个父亲
    const parent = nodes[0].parent;
    const isSameParent = nodes.every((node) => node.parent === parent);
    if (!isSameParent) return false;

    // 判断节点索引是否连续
    const indexes = nodes.map((node) => node.index).sort((a, b) => a - b);
    const isIndexContinuous = indexes.every((index, i, arr) => {
      if (i === 0) {
        return true;
      }
      return index === arr[i - 1] + 1;
    });
    if (!isIndexContinuous) return false;

    // 判断节点父亲是否已经在分组中
    const parents = this.findNodeParents(nodes[0]);
    const parentsInGroup = parents.some((parent) => this.isNodeInGroup(parent));
    if (parentsInGroup) return false;

    // 参数正确
    return true;
  }

  /** 获取节点分组控制 */
  public static getNodeGroupController(node?: FlowNodeEntity): FlowGroupController | undefined {
    if (!node) {
      return;
    }
    if (!this.isNodeInGroup(node)) {
      return;
    }
    const groupNode = node?.parent;
    return FlowGroupController.create(groupNode);
  }

  /** 向上递归查找分组递归控制 */
  public static getNodeRecursionGroupController(
    node?: FlowNodeEntity
  ): FlowGroupController | undefined {
    if (!node) {
      return;
    }
    const group = this.getNodeGroupController(node);
    if (group) {
      return group;
    }
    if (node.parent) {
      return this.getNodeRecursionGroupController(node.parent);
    }
    return;
  }

  /** 是否分组节点 */
  public static isGroupNode(group: FlowNodeEntity): boolean {
    return group.flowNodeType === FlowNodeBaseType.GROUP;
  }

  /** 找到节点所有上级 */
  private static findNodeParents(node: FlowNodeEntity): FlowNodeEntity[] {
    const parents = [];
    let parent = node.parent;
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  }

  /** 节点是否处于分组中 */
  private static isNodeInGroup(node: FlowNodeEntity): boolean {
    // 处于分组中
    if (node?.parent?.flowNodeType === FlowNodeBaseType.GROUP) {
      return true;
    }
    return false;
  }
}
