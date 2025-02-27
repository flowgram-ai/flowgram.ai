import { inject, injectable } from 'inversify';
import { delay, DisposableCollection, Rectangle } from '@flowgram.ai/utils';
import type { IPoint, PositionSchema } from '@flowgram.ai/utils';
import {
  WorkflowDocument,
  WorkflowDragService,
  WorkflowLinesManager,
  WorkflowPortEntity,
  WorkflowNodePortsData,
  WorkflowNodeEntity,
} from '@flowgram.ai/free-layout-core';
import { WorkflowSelectService } from '@flowgram.ai/free-layout-core';
import { WorkflowNodeJSON } from '@flowgram.ai/free-layout-core';
import { FreeOperationType, HistoryService } from '@flowgram.ai/free-history-plugin';
import { FlowNodeTransformData } from '@flowgram.ai/document';
import { FlowNodeBaseType } from '@flowgram.ai/document';
import { PlaygroundConfigEntity } from '@flowgram.ai/core';
import { TransformData } from '@flowgram.ai/core';

import { isGreaterThan, isLessThan } from './utils';
import type { CallNodePanel, NodePanelCallParams, NodePanelResult } from './type';

/**
 * 添加节点面板服务
 */
@injectable()
export class WorkflowNodePanelService {
  @inject(WorkflowDocument) private readonly document: WorkflowDocument;

  @inject(WorkflowDragService)
  private readonly dragService: WorkflowDragService;

  @inject(WorkflowSelectService)
  private readonly selectService: WorkflowSelectService;

  @inject(WorkflowLinesManager)
  private readonly linesManager: WorkflowLinesManager;

  @inject(PlaygroundConfigEntity)
  private readonly playgroundConfig: PlaygroundConfigEntity;

  @inject(HistoryService) private readonly historyService: HistoryService;

  private readonly toDispose = new DisposableCollection();

  private callNodePanel: CallNodePanel = async () => undefined;

  /** 销毁 */
  public dispose(): void {
    this.toDispose.dispose();
  }

  public setCallNodePanel(callNodePanel: CallNodePanel) {
    this.callNodePanel = callNodePanel;
  }

  /** 唤起节点面板 */
  public async call(
    callParams: NodePanelCallParams
  ): Promise<WorkflowNodeEntity | WorkflowNodeEntity[] | undefined> {
    const {
      panelPosition,
      fromPort,
      enableMultiAdd = false,
      panelProps = {},
      containerNode,
      afterAddNode,
    } = callParams;

    if (!panelPosition || this.playgroundConfig.readonly) {
      return;
    }

    const nodes: WorkflowNodeEntity[] = [];

    return new Promise((resolve) => {
      this.callNodePanel({
        position: panelPosition,
        enableMultiAdd,
        panelProps,
        containerNode: this.getContainerNode({
          fromPort,
          containerNode,
        }),
        onSelect: async (panelParams?: NodePanelResult) => {
          const node = await this.addNode(callParams, panelParams);
          afterAddNode?.(node);
          if (!enableMultiAdd) {
            resolve(node);
          } else if (node) {
            nodes.push(node);
          }
        },
        onClose: () => {
          resolve(enableMultiAdd ? nodes : undefined);
        },
      });
    });
  }

  /** 添加节点 */
  private async addNode(
    callParams: NodePanelCallParams,
    panelParams: NodePanelResult
  ): Promise<WorkflowNodeEntity | undefined> {
    const {
      panelPosition,
      fromPort,
      toPort,
      canAddNode,
      autoOffsetPadding = {
        x: 100,
        y: 100,
      },
      enableBuildLine = false,
      enableSelectPosition = false,
      enableAutoOffset = false,
      enableDragNode = false,
    } = callParams;

    if (!panelPosition || !panelParams) {
      return;
    }

    const { nodeType, selectEvent, nodeJSON } = panelParams;

    const containerNode = this.getContainerNode({
      fromPort,
      containerNode: callParams.containerNode,
    });

    // 判断是否可以添加节点
    if (canAddNode) {
      const canAdd = canAddNode({ nodeType, containerNode });
      if (!canAdd) {
        return;
      }
    }

    // 鼠标选择坐标
    const selectPosition = this.playgroundConfig.getPosFromMouseEvent(selectEvent);

    // 自定义坐标
    const nodePosition: PositionSchema = callParams.customPosition
      ? callParams.customPosition({ nodeType, selectPosition })
      : this.adjustNodePosition({
          nodeType,
          position: enableSelectPosition ? selectPosition : panelPosition,
          fromPort,
          toPort,
          containerNode,
        });

    // 创建节点
    const node: WorkflowNodeEntity = await this.document.createWorkflowNodeByType(
      nodeType,
      nodePosition,
      nodeJSON ?? ({} as WorkflowNodeJSON),
      containerNode?.id
    );

    if (!node) {
      return;
    }

    // 后续节点偏移
    if (enableAutoOffset && fromPort && toPort) {
      const subOffset = this.subPositionOffset({
        node,
        fromPort,
        toPort,
        padding: autoOffsetPadding,
      });
      const subsequentNodes = this.getSubsequentNodes(toPort.node);
      this.updateSubSequentNodesPosition({
        node,
        subsequentNodes,
        fromPort,
        toPort,
        containerNode,
        offset: subOffset,
      });
    }

    if (!enableBuildLine && !enableDragNode) {
      return node;
    }

    // 等待节点渲染
    await delay(20);

    // 重建连线（需先让端口完成渲染）
    if (enableBuildLine) {
      this.buildLine({
        fromPort,
        node,
        toPort,
      });
    }

    // 开始拖拽节点
    if (enableDragNode) {
      this.selectService.selectNode(node);
      this.dragService.startDragSelectedNodes(selectEvent);
    }

    return node;
  }

  /** 建立连线 */
  private buildLine(params: {
    node: WorkflowNodeEntity;
    fromPort?: WorkflowPortEntity;
    toPort?: WorkflowPortEntity;
  }): void {
    const { fromPort, node, toPort } = params;
    const portsData = node.getData(WorkflowNodePortsData);
    if (!portsData) {
      return;
    }

    const shouldBuildFromLine = portsData.inputPorts?.length > 0;
    if (fromPort && shouldBuildFromLine) {
      const toTargetPort = portsData.inputPorts[0];
      const isSingleInput = portsData.inputPorts.length === 1;
      this.linesManager.createLine({
        from: fromPort.node.id,
        fromPort: fromPort.portID,
        to: node.id,
        toPort: isSingleInput ? undefined : toTargetPort.id,
      });
    }
    const shouldBuildToLine = portsData.outputPorts?.length > 0;
    if (toPort && shouldBuildToLine) {
      const fromTargetPort = portsData.outputPorts[0];
      this.linesManager.createLine({
        from: node.id,
        fromPort: fromTargetPort.portID,
        to: toPort.node.id,
        toPort: toPort.portID,
      });
    }
  }

  /** 调整节点坐标 */
  private adjustNodePosition(params: {
    nodeType: string;
    position: PositionSchema;
    fromPort?: WorkflowPortEntity;
    toPort?: WorkflowPortEntity;
    containerNode?: WorkflowNodeEntity;
  }): PositionSchema {
    const { nodeType, position, fromPort, toPort, containerNode } = params;
    const register = this.document.getNodeRegistry(nodeType);
    const size = register?.meta?.size;
    let adjustedPosition = position;
    if (!size) {
      adjustedPosition = position;
    }
    // 计算坐标偏移
    else if (fromPort && toPort) {
      // 输入输出
      adjustedPosition = {
        x: position.x,
        y: position.y - size.height / 2,
      };
    } else if (fromPort && !toPort) {
      // 仅输入
      adjustedPosition = {
        x: position.x + size.width / 2,
        y: position.y - size.height / 2,
      };
    } else if (!fromPort && toPort) {
      // 仅输出
      adjustedPosition = {
        x: position.x - size.width / 2,
        y: position.y - size.height / 2,
      };
    } else {
      adjustedPosition = position;
    }
    return this.dragService.adjustSubNodePosition(nodeType, containerNode, adjustedPosition);
  }

  private getContainerNode(params: {
    containerNode?: WorkflowNodeEntity;
    fromPort?: WorkflowPortEntity;
    toPort?: WorkflowPortEntity;
  }): WorkflowNodeEntity | undefined {
    const { fromPort, containerNode } = params;
    if (containerNode) {
      return containerNode;
    }
    const fromNode = fromPort?.node;
    const fromContainer = fromNode?.parent;
    if (fromNode?.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
      // 子画布内部输入连线
      return fromNode;
    }
    return fromContainer;
  }

  /** 获取端口矩形 */
  private getPortBox(port: WorkflowPortEntity, offset: IPoint = { x: 0, y: 0 }): Rectangle {
    const node = port.node;
    if (node.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
      // 子画布内部端口需要虚拟节点
      const { point } = port;
      if (port.portType === 'input') {
        return new Rectangle(point.x + offset.x, point.y - 50 + offset.y, 300, 100);
      }
      return new Rectangle(point.x - 300, point.y - 50, 300, 100);
    }
    const box = node.getData(FlowNodeTransformData).bounds;
    return box;
  }

  /** 后续节点位置偏移 */
  private subPositionOffset(params: {
    node: WorkflowNodeEntity;
    fromPort: WorkflowPortEntity;
    toPort: WorkflowPortEntity;
    padding: {
      x: number;
      y: number;
    };
  }):
    | {
        x: number;
        y: number;
      }
    | undefined {
    const { node, fromPort, toPort, padding } = params;

    const fromBox = this.getPortBox(fromPort);
    const toBox = this.getPortBox(toPort);

    const nodeTrans = node.getData(FlowNodeTransformData);
    const nodeSize = node.getNodeMeta()?.size ?? {
      width: nodeTrans.bounds.width,
      height: nodeTrans.bounds.height,
    };

    // 最小距离
    const minDistance: IPoint = {
      x: nodeSize.width + padding.x,
      y: nodeSize.height + padding.y,
    };
    // from 与 to 的距离
    const boxDistance = this.rectDistance(fromBox, toBox);

    // 需要的偏移量
    const neededOffset: IPoint = {
      x: isGreaterThan(boxDistance.x, minDistance.x) ? 0 : minDistance.x - boxDistance.x,
      y: isGreaterThan(boxDistance.y, minDistance.y) ? 0 : minDistance.y - boxDistance.y,
    };

    // 至少有一个方向满足要求，无需偏移
    if (neededOffset.x === 0 || neededOffset.y === 0) {
      return;
    }

    // 是否存在相交
    const intersection = {
      // 这里没有写反，Rectangle内置的算法是反的
      vertical: Rectangle.intersects(fromBox, toBox, 'horizontal'),
      horizontal: Rectangle.intersects(fromBox, toBox, 'vertical'),
    };

    // 初始化偏移量
    let offsetX: number = 0;
    let offsetY: number = 0;

    if (!intersection.horizontal) {
      // 水平不相交，需要加垂直方向的偏移
      if (isGreaterThan(toBox.center.y, fromBox.center.y)) {
        // B在A下方
        offsetY = neededOffset.y;
      } else if (isLessThan(toBox.center.y, fromBox.center.y)) {
        // B在A上方
        offsetY = -neededOffset.y;
      }
    }

    if (!intersection.vertical) {
      // 垂直不相交，需要加水平方向的偏移
      if (isGreaterThan(toBox.center.x, fromBox.center.x)) {
        // B在A右侧
        offsetX = neededOffset.x;
      } else if (isLessThan(toBox.center.x, fromBox.center.x)) {
        // B在A左侧
        offsetX = -neededOffset.x;
      }
    }

    return {
      x: offsetX,
      y: offsetY,
    };
  }

  /** 矩形间距 */
  private rectDistance(rectA: Rectangle, rectB: Rectangle): IPoint {
    // 计算 x 轴距离
    const distanceX = Math.abs(
      Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left)
    );
    // 计算 y 轴距离
    const distanceY = Math.abs(
      Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top)
    );
    if (Rectangle.intersects(rectA, rectB)) {
      // 相交距离为负
      return {
        x: -distanceX,
        y: -distanceY,
      };
    }
    return {
      x: distanceX,
      y: distanceY,
    };
  }

  /** 获取后续节点 */
  private getSubsequentNodes(node: WorkflowNodeEntity): WorkflowNodeEntity[] {
    if (node.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
      return [];
    }
    const brothers = node.parent?.collapsedChildren ?? [];
    const linkedBrothers = new Set();
    const linesMap = new Map<string, string[]>();
    this.linesManager.getAllLines().forEach((line) => {
      if (!linesMap.has(line.from.id)) {
        linesMap.set(line.from.id, []);
      }
      if (
        !line.to?.id ||
        line.to.flowNodeType === FlowNodeBaseType.SUB_CANVAS // 子画布内部成环
      ) {
        return;
      }
      linesMap.get(line.from.id)?.push(line.to.id);
    });

    const bfs = (nodeId: string) => {
      if (linkedBrothers.has(nodeId)) {
        return;
      }
      linkedBrothers.add(nodeId);
      const nextNodes = linesMap.get(nodeId) ?? [];
      nextNodes.forEach(bfs);
    };

    bfs(node.id);

    const subsequentNodes = brothers.filter((node) => linkedBrothers.has(node.id));
    return subsequentNodes;
  }

  /** 更新后续节点位置 */
  private updateSubSequentNodesPosition(params: {
    node: WorkflowNodeEntity;
    subsequentNodes: WorkflowNodeEntity[];
    fromPort: WorkflowPortEntity;
    toPort: WorkflowPortEntity;
    containerNode?: WorkflowNodeEntity;
    offset?: IPoint;
  }): void {
    const { node, subsequentNodes, fromPort, toPort, containerNode, offset } = params;
    if (!offset || !toPort) {
      return;
    }
    // 更新后续节点位置
    const subsequentNodesPositions = subsequentNodes.map((node) => {
      const nodeTrans = node.getData(TransformData);
      return {
        x: nodeTrans.position.x,
        y: nodeTrans.position.y,
      };
    });
    this.historyService.pushOperation({
      type: FreeOperationType.dragNodes,
      value: {
        ids: subsequentNodes.map((node) => node.id),
        value: subsequentNodesPositions.map((position) => ({
          x: position.x + offset.x,
          y: position.y + offset.y,
        })),
        oldValue: subsequentNodesPositions,
      },
    });
    // 新增节点坐标需重新计算
    const fromBox = this.getPortBox(fromPort);
    const toBox = this.getPortBox(toPort, offset);
    const nodeTrans = node.getData(TransformData);
    let nodePos: PositionSchema = {
      x: (fromBox.center.x + toBox.center.x) / 2,
      y: (fromBox.y + toBox.y) / 2,
    };
    if (containerNode) {
      nodePos = this.dragService.adjustSubNodePosition(
        node.flowNodeType as string,
        containerNode,
        nodePos
      );
    }
    this.historyService.pushOperation({
      type: FreeOperationType.dragNodes,
      value: {
        ids: [node.id],
        value: [nodePos],
        oldValue: [
          {
            x: nodeTrans.position.x,
            y: nodeTrans.position.y,
          },
        ],
      },
    });
  }
}
