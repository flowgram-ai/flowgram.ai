import { customAlphabet } from 'nanoid';
import { inject, injectable, optional, postConstruct } from 'inversify';
import { Disposable, Emitter, type IPoint } from '@flowgram.ai/utils';
import { NodeEngineContext } from '@flowgram.ai/form-core';
import { FlowDocument, FlowNodeBaseType, FlowNodeTransformData } from '@flowgram.ai/document';
import {
  injectPlaygroundContext,
  PlaygroundConfigEntity,
  PlaygroundContext,
  PositionData,
  TransformData,
} from '@flowgram.ai/core';

import { WorkflowLinesManager } from './workflow-lines-manager';
import {
  WorkflowDocumentOptions,
  WorkflowDocumentOptionsDefault,
} from './workflow-document-option';
import { getFlowNodeFormData } from './utils/flow-node-form-data';
import { delay, fitView, getAntiOverlapPosition } from './utils';
import {
  type WorkflowContentChangeEvent,
  WorkflowContentChangeType,
  WorkflowEdgeJSON,
  type WorkflowJSON,
  type WorkflowNodeJSON,
  type WorkflowNodeMeta,
  type WorkflowNodeRegistry,
  WorkflowSubCanvas,
} from './typings';
import { WorkflowSelectService } from './service/workflow-select-service';
import { FREE_LAYOUT_KEY, type FreeLayout } from './layout';
import { WorkflowNodeLinesData } from './entity-datas';
import {
  WorkflowLineEntity,
  WorkflowLinePortInfo,
  WorkflowNodeEntity,
  WorkflowPortEntity,
} from './entities';

const nanoid = customAlphabet('1234567890', 5);

export const WorkflowDocumentProvider = Symbol('WorkflowDocumentProvider');
export type WorkflowDocumentProvider = () => WorkflowDocument;

@injectable()
export class WorkflowDocument extends FlowDocument {
  private _onContentChangeEmitter = new Emitter<WorkflowContentChangeEvent>();

  protected readonly onLoadedEmitter = new Emitter<void>();

  readonly onContentChange = this._onContentChangeEmitter.event;

  private _onReloadEmitter = new Emitter<WorkflowDocument>();

  readonly onReload = this._onReloadEmitter.event;

  private disposed = false;

  /**
   * 数据加载完成
   */
  readonly onLoaded = this.onLoadedEmitter.event;

  protected _loading = false;

  @inject(WorkflowLinesManager) linesManager: WorkflowLinesManager;

  @inject(PlaygroundConfigEntity) playgroundConfig: PlaygroundConfigEntity;

  @injectPlaygroundContext() playgroundContext: PlaygroundContext;

  @inject(WorkflowDocumentOptions)
  options: WorkflowDocumentOptions = {};

  @inject(NodeEngineContext) @optional() nodeEngineContext: NodeEngineContext;

  @inject(WorkflowSelectService) selectServices: WorkflowSelectService;

  get loading(): boolean {
    return this._loading;
  }

  async fitView(easing?: boolean): Promise<void> {
    return fitView(this, this.playgroundConfig, easing).then(() => {
      this.linesManager.forceUpdate();
    });
  }

  @postConstruct()
  init(): void {
    super.init();
    this.currentLayoutKey = this.options.defaultLayout || FREE_LAYOUT_KEY;
    this.linesManager.init(this);
    this.playgroundConfig.getCursors = () => this.options.cursors;
    this.linesManager.onAvailableLinesChange((e) => this.fireContentChange(e));
    this.playgroundConfig.onReadonlyOrDisabledChange(({ readonly }) => {
      if (this.nodeEngineContext) {
        this.nodeEngineContext.readonly = readonly;
      }
    });
  }

  async load(): Promise<void> {
    this._loading = true;
    await super.load();
    this._loading = false;
    this.onLoadedEmitter.fire();
  }

  async reload(json: WorkflowJSON, delayTime = 0): Promise<void> {
    this._loading = true;
    this.clear();
    this.fromJSON(json);
    // loading添加delay，避免reload时触发fireContentChange的副作用
    await delay(delayTime);
    this._loading = false;
    this._onReloadEmitter.fire(this);
  }

  /**
   * 从数据加载
   * @param json
   */
  fromJSON(json: Partial<WorkflowJSON>, fireRender = true): void {
    const { flattenJSON, nodeBlocks, nodeEdges } = this.flatJSON(json);
    const nestedJSON = this.nestJSON(flattenJSON, nodeBlocks, nodeEdges);
    // 触发画布更新
    this.entityManager.changeEntityLocked = true;

    // 逐层渲染
    this.renderJSON(nestedJSON);

    this.entityManager.changeEntityLocked = false;
    this.transformer.loading = false;
    // 批量触发画布更新
    if (fireRender) {
      this.fireRender();
    }
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.getAllNodes().map((node) => node.dispose()); // 清空节点
    this.linesManager.getAllLines().map((line) => line.dispose()); // 清空线条
    this.getAllPorts().map((port) => port.dispose()); // 清空端口
    this.selectServices.clear(); // 清空选择
  }

  /**
   * 创建流程节点
   * @param json
   */
  createWorkflowNode(
    json: WorkflowNodeJSON,
    isClone: boolean = false,
    parentId?: string
  ): WorkflowNodeEntity {
    // 是否是一个已经存在的节点
    const isExistedNode = this.getNode(json.id);
    const parent = this.getNode(parentId ?? this.root.id) ?? this.root;
    const node = this.addNode(
      {
        ...json,
        parent,
      },
      undefined,
      true
    ) as WorkflowNodeEntity;

    const registry = node.getNodeRegistry() as WorkflowNodeRegistry;
    const { formMeta } = registry;
    const meta = node.getNodeMeta<WorkflowNodeMeta>();
    const formData = getFlowNodeFormData(node);

    const transform = node.getData<FlowNodeTransformData>(FlowNodeTransformData)!;
    const freeLayout = this.layout as FreeLayout;
    transform.onDataChange(() => {
      // TODO 这个有点难以理解，其实是为了同步size 数据
      freeLayout.syncTransform(node);
    });
    let { position } = meta;
    if (!position) {
      // 获取默认的位置
      position = this.getNodeDefaultPosition(json.type);
    }

    // 更新节点位置信息
    node.getData(TransformData)!.update({
      position,
    });

    // 初始化表单数据
    if (formMeta && formData) {
      formData.createForm(formMeta, json.data);
      // formData.onDataChange(() => node.getData(FlowNodeRenderData)!.fireChange())
      formData.onDataChange(() => {
        this.fireContentChange({
          type: WorkflowContentChangeType.NODE_DATA_CHANGE,
          toJSON: () => formData.toJSON(),
          entity: node,
        });
      });
    }
    // 位置变更
    const positionData = node.getData<PositionData>(PositionData)!;
    positionData.onDataChange(() => {
      this.fireContentChange({
        type: WorkflowContentChangeType.MOVE_NODE,
        toJSON: () => positionData.toJSON(),
        entity: node,
      });
    });

    const subCanvas = this.getNodeSubCanvas(node);

    if (!isExistedNode && !subCanvas?.isCanvas) {
      this.fireContentChange({
        type: WorkflowContentChangeType.ADD_NODE,
        entity: node,
        toJSON: () => this.toNodeJSON(node),
      });
      node.toDispose.push(
        Disposable.create(() => {
          this.fireContentChange({
            type: WorkflowContentChangeType.DELETE_NODE,
            entity: node,
            toJSON: () => this.toNodeJSON(node),
          });
        })
      );
      node.toDispose.push(
        Disposable.create(() => {
          if (!node.parent || node.parent.flowNodeType === FlowNodeBaseType.ROOT) {
            return;
          }
          const parentTransform = node.parent.getData(FlowNodeTransformData);
          // 加延迟是因为这个回调触发时节点实体还没有被销毁
          setTimeout(() => {
            parentTransform.fireChange();
          }, 0);
        })
      );
    }

    // 若存在子节点，则创建子节点
    if (json.blocks) {
      this.renderJSON(
        { nodes: json.blocks, edges: json.edges ?? [] },
        {
          parent: node,
          isClone,
        }
      );
    }
    // 子画布联动
    if (subCanvas) {
      const canvasTransform = subCanvas.canvasNode.getData<TransformData>(TransformData);
      canvasTransform.update({
        position: subCanvas.parentNode.getNodeMeta()?.canvasPosition,
      });
      subCanvas.parentNode.onDispose(() => {
        subCanvas.canvasNode.dispose();
      });
      subCanvas.canvasNode.onDispose(() => {
        subCanvas.parentNode.dispose();
      });
    }

    this.onNodeCreateEmitter.fire({
      node,
      data: json,
    });

    return node;
  }

  /**
   * 获取默认的 x y 坐标, 默认为当前画布可视区域中心
   * @param type
   * @protected
   */
  getNodeDefaultPosition(type: string | number): IPoint {
    const { size } = this.getNodeRegistry(type).meta || {};
    // 当前可视区域的中心位置
    let position = this.playgroundConfig.getViewport(true).center;
    if (size) {
      position = {
        x: position.x,
        y: position.y - size.height / 2,
      };
    }
    // 去掉叠加的
    return getAntiOverlapPosition(this, position);
  }

  /**
   * 通过类型创建节点, 如果没有提供position 则直接放在画布中间
   * @param type
   */
  createWorkflowNodeByType(
    type: string | number,
    position?: IPoint,
    json: Partial<WorkflowNodeJSON> = {},
    parentID?: string
  ): WorkflowNodeEntity {
    let id: string = json.id as string;
    if (id === undefined) {
      // 保证 id 不要重复
      do {
        id = `1${nanoid()}`;
      } while (this.entityManager.getEntityById(id));
    } else {
      if (this.entityManager.getEntityById(id)) {
        throw new Error(`[WorkflowDocument.createWorkflowNodeByType] Node Id "${id}" duplicated.`);
      }
    }
    return this.createWorkflowNode(
      {
        id,
        type,
        meta: { position, ...json?.meta }, // TODO title 和 meta 要从注册数据去拿
        data: json?.data,
        blocks: json?.blocks,
        edges: json?.edges,
      },
      false,
      parentID
    );
  }

  getAllNodes(): WorkflowNodeEntity[] {
    return this.entityManager
      .getEntities<WorkflowNodeEntity>(WorkflowNodeEntity)
      .filter((n) => n.id !== FlowNodeBaseType.ROOT);
  }

  getAllPorts(): WorkflowPortEntity[] {
    return this.entityManager
      .getEntities<WorkflowPortEntity>(WorkflowPortEntity)
      .filter((p) => p.node.id !== FlowNodeBaseType.ROOT);
  }

  /**
   * 获取画布中的非游离节点
   * 1. 开始节点
   * 2. 从开始节点出发能走到的节点
   * 3. 结束节点
   * 4. 默认所有子画布内节点为游离节点
   */
  getAssociatedNodes(): WorkflowNodeEntity[] {
    const allNode = this.getAllNodes();

    const allLines = this.linesManager
      .getAllLines()
      .filter((line) => line.from && line.to)
      .map((line) => ({
        from: line.from.id,
        to: line.to!.id,
      }));

    const startNodeId = allNode.find((node) => node.isStart)!.id;
    const endNodeId = allNode.find((node) => node.isNodeEnd)!.id;

    // 子画布内节点无需开始/结束
    const nodeInSubCanvas = allNode
      .filter((node) => node.parent?.flowNodeType === FlowNodeBaseType.SUB_CANVAS)
      .map((node) => node.id);

    const associatedCache = new Set([endNodeId, ...nodeInSubCanvas]);
    const bfs = (nodeId: string) => {
      if (associatedCache.has(nodeId)) {
        return;
      }
      associatedCache.add(nodeId);
      const nextNodes = allLines.reduce((ids, { from, to }) => {
        if (from === nodeId && !associatedCache.has(to)) {
          ids.push(to);
        }
        return ids;
      }, [] as string[]);

      nextNodes.forEach(bfs);
    };

    bfs(startNodeId);

    const associatedNodes = allNode.filter((node) => associatedCache.has(node.id));

    return associatedNodes;
  }

  /**
   * 触发渲染
   */
  fireRender() {
    this.entityManager.fireEntityChanged(WorkflowNodeEntity.type);
    this.entityManager.fireEntityChanged(WorkflowLineEntity.type);
    this.entityManager.fireEntityChanged(WorkflowPortEntity.type);
  }

  fireContentChange(event: WorkflowContentChangeEvent): void {
    if (this._loading || this.disposed || this.entityManager.changeEntityLocked) {
      return;
    }
    this._onContentChangeEmitter.fire(event);
  }

  toNodeJSON(node: WorkflowNodeEntity): WorkflowNodeJSON {
    // 如果是子画布，返回其父节点的JSON
    const subCanvas = this.getNodeSubCanvas(node);
    if (subCanvas?.isCanvas === true) {
      return this.toNodeJSON(subCanvas.parentNode);
    }

    const json = this.toNodeJSONFromOptions(node);
    const children = this.getNodeChildren(node);

    // 计算子节点 JSON
    const blocks = children.map((child) => this.toNodeJSON(child));

    // 计算子线条 JSON
    const linesMap = new Map<string, WorkflowEdgeJSON>();
    children.forEach((child) => {
      const childLinesData = child.getData<WorkflowNodeLinesData>(WorkflowNodeLinesData);
      [...childLinesData.inputLines, ...childLinesData.outputLines]
        .filter(Boolean)
        .forEach((line) => {
          const lineJSON = this.toLineJSON(line);
          if (!lineJSON || linesMap.has(line.id)) {
            return;
          }
          linesMap.set(line.id, lineJSON);
        });
    });
    const edges = Array.from(linesMap.values()); // 使用 Map 防止线条重复

    // 拼接 JSON
    if (blocks.length > 0) json.blocks = blocks;
    if (edges.length > 0) json.edges = edges;

    return json;
  }

  /**
   * 节点转换为JSON， 没有format的过程
   * @param node
   * @returns
   */
  private toNodeJSONFromOptions(node: WorkflowNodeEntity): WorkflowNodeJSON {
    if (this.options.toNodeJSON) {
      return this.options.toNodeJSON(node) as WorkflowNodeJSON;
    }
    return WorkflowDocumentOptionsDefault.toNodeJSON!(node) as WorkflowNodeJSON;
  }

  copyNode(
    node: WorkflowNodeEntity,
    newNodeId?: string | undefined,
    format?: (json: WorkflowNodeJSON) => WorkflowNodeJSON,
    position?: IPoint
  ): WorkflowNodeEntity {
    let json = this.toNodeJSON(node);
    if (format) {
      json = format(json);
    }
    position = position || {
      x: json.meta!.position!.x + 30,
      y: json.meta!.position!.y + 30,
    };
    return this.createWorkflowNode(
      {
        id: newNodeId || `1${nanoid()}`,
        type: node.flowNodeType,
        meta: {
          ...json.meta,
          position,
        },
        data: json.data,
        blocks: json.blocks,
        edges: json.edges,
      },
      true,
      node.parent?.id
    );
  }

  copyNodeFromJSON(
    flowNodeType: string,
    nodeJSON: WorkflowNodeJSON,
    newNodeId?: string | undefined,
    position?: IPoint,
    parentId?: string
  ): WorkflowNodeEntity {
    position = position || {
      x: nodeJSON.meta!.position!.x + 30,
      y: nodeJSON.meta!.position!.y + 30,
    };
    return this.createWorkflowNode(
      {
        id: newNodeId || `1${nanoid()}`,
        type: flowNodeType,
        meta: {
          ...nodeJSON.meta,
          position,
        },
        data: nodeJSON.data,
        blocks: nodeJSON.blocks,
        edges: nodeJSON.edges,
      },
      true,
      parentId
    );
  }

  canRemove(node: WorkflowNodeEntity, silent?: boolean): boolean {
    const meta = node.getNodeMeta<WorkflowNodeMeta>();
    if (meta.deleteDisable) {
      return false;
    }
    if (this.options.canDeleteNode && !this.options.canDeleteNode(node, silent)) {
      return false;
    }
    return true;
  }

  /**
   * 判断端口是否为错误态
   */
  isErrorPort(port: WorkflowPortEntity) {
    if (typeof this.options.isErrorPort === 'function') {
      return this.options.isErrorPort(port);
    }

    return false;
  }

  /**
   * 导出数据
   */
  toJSON(): WorkflowJSON {
    // 要等 一些节点的 dispose 触发结束
    // await delay(10);
    const rootJSON = this.toNodeJSON(this.root);
    return {
      nodes: rootJSON.blocks ?? [],
      edges: rootJSON.edges ?? [],
    };
  }

  dispose() {
    if (this.disposed) {
      return;
    }
    super.dispose();
    this.disposed = true;
    this._onReloadEmitter.dispose();
  }

  private getEdgeID(edge: WorkflowEdgeJSON): string {
    return WorkflowLineEntity.portInfoToLineId({
      from: edge.sourceNodeID,
      to: edge.targetNodeID,
      fromPort: edge.sourcePortID,
      toPort: edge.targetPortID,
    });
  }

  /**
   * 拍平树形json结构，将结构信息提取到map
   */
  private flatJSON(json: Partial<WorkflowJSON> = { nodes: [], edges: [] }): {
    flattenJSON: WorkflowJSON;
    nodeBlocks: Map<string, string[]>;
    nodeEdges: Map<string, string[]>;
  } {
    const nodeBlocks = new Map<string, string[]>();
    const nodeEdges = new Map<string, string[]>();
    const rootNodes = json.nodes ?? [];
    const rootEdges = json.edges ?? [];
    const flattenNodeJSONs: WorkflowNodeJSON[] = [...rootNodes];
    const flattenEdgeJSONs: WorkflowEdgeJSON[] = [...rootEdges];

    const rootBlockIDs: string[] = rootNodes.map((node) => node.id);
    const rootEdgeIDs: string[] = rootEdges.map((edge) => this.getEdgeID(edge));

    nodeBlocks.set(FlowNodeBaseType.ROOT, rootBlockIDs);
    nodeEdges.set(FlowNodeBaseType.ROOT, rootEdgeIDs);

    // 如需支持多层结构，以下部分改为递归
    rootNodes.forEach((nodeJSON) => {
      const { blocks, edges } = nodeJSON;
      if (blocks) {
        flattenNodeJSONs.push(...blocks);
        const blockIDs: string[] = [];
        blocks.forEach((block) => {
          blockIDs.push(block.id);
        });
        nodeBlocks.set(nodeJSON.id, blockIDs);
        delete nodeJSON.blocks;
      }
      if (edges) {
        flattenEdgeJSONs.push(...edges);
        const edgeIDs: string[] = [];
        edges.forEach((edge) => {
          const edgeID = this.getEdgeID(edge);
          edgeIDs.push(edgeID);
        });
        nodeEdges.set(nodeJSON.id, edgeIDs);
        delete nodeJSON.edges;
      }
    });

    const flattenJSON: WorkflowJSON = {
      nodes: flattenNodeJSONs,
      edges: flattenEdgeJSONs,
    };

    return {
      flattenJSON,
      nodeBlocks,
      nodeEdges,
    };
  }

  /**
   * 对JSON进行分层
   */
  private nestJSON(
    flattenJSON: WorkflowJSON,
    nodeBlocks: Map<string, string[]>,
    nodeEdges: Map<string, string[]>
  ): WorkflowJSON {
    const nestJSON: WorkflowJSON = {
      nodes: [],
      edges: [],
    };
    const nodeMap = new Map<string, WorkflowNodeJSON>();
    const edgeMap = new Map<string, WorkflowEdgeJSON>();
    const rootBlockSet = new Set<string>(nodeBlocks.get(FlowNodeBaseType.ROOT) ?? []);
    const rootEdgeSet = new Set<string>(nodeEdges.get(FlowNodeBaseType.ROOT) ?? []);

    // 构造缓存
    flattenJSON.nodes.forEach((nodeJSON) => {
      nodeMap.set(nodeJSON.id, nodeJSON);
    });

    flattenJSON.edges.forEach((edgeJSON) => {
      const edgeID = this.getEdgeID(edgeJSON);
      edgeMap.set(edgeID, edgeJSON);
    });

    // 恢复层级数据
    flattenJSON.nodes.forEach((nodeJSON) => {
      if (rootBlockSet.has(nodeJSON.id)) {
        nestJSON.nodes.push(nodeJSON);
      }
      // 恢复blocks
      if (nodeBlocks.has(nodeJSON.id)) {
        const blockIDs = nodeBlocks.get(nodeJSON.id)!;
        const blockJSONs: WorkflowNodeJSON[] = blockIDs
          .map((blockID) => nodeMap.get(blockID)!)
          .filter(Boolean);
        nodeJSON.blocks = blockJSONs;
      }
      // 恢复edges
      if (nodeEdges.has(nodeJSON.id)) {
        const edgeIDs = nodeEdges.get(nodeJSON.id)!;
        const edgeJSONs: WorkflowEdgeJSON[] = edgeIDs
          .map((edgeID) => edgeMap.get(edgeID)!)
          .filter(Boolean);
        nodeJSON.edges = edgeJSONs;
      }
    });

    flattenJSON.edges.forEach((edgeJSON) => {
      const edgeID = this.getEdgeID(edgeJSON);
      if (rootEdgeSet.has(edgeID)) {
        nestJSON.edges.push(edgeJSON);
      }
    });

    return nestJSON;
  }

  /**
   * 逐层创建节点和线条
   */
  private renderJSON(
    json: WorkflowJSON,
    options?: {
      parent?: WorkflowNodeEntity;
      isClone?: boolean;
    }
  ) {
    // await delay(0); // Loop 节点 onCreate 存在异步创建子画布
    const { parent = this.root, isClone = false } = options ?? {};
    // 创建节点
    const containerID = this.getNodeSubCanvas(parent)?.canvasNode.id ?? parent.id;
    json.nodes.forEach((nodeJSON: WorkflowNodeJSON) => {
      this.createWorkflowNode(nodeJSON, isClone, containerID);
    }),
      // 创建线条
      json.edges.forEach((edge) => this.createWorkflowLine(edge, containerID));
  }

  private getNodeSubCanvas(node: WorkflowNodeEntity): WorkflowSubCanvas | undefined {
    if (!node) return;
    const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
    const subCanvas = nodeMeta.subCanvas?.(node);
    return subCanvas;
  }

  private getNodeChildren(node: WorkflowNodeEntity): WorkflowNodeEntity[] {
    if (!node) return [];
    const subCanvas = this.getNodeSubCanvas(node);
    const childrenWithCanvas = subCanvas
      ? subCanvas.canvasNode.collapsedChildren
      : node.collapsedChildren;
    // 过滤掉子画布的JSON数据
    const children = childrenWithCanvas
      .filter((child) => {
        const childMeta = child.getNodeMeta<WorkflowNodeMeta>();
        return !childMeta.subCanvas?.(node)?.isCanvas;
      })
      .filter(Boolean);
    return children;
  }

  private toLineJSON(line: WorkflowLineEntity): WorkflowEdgeJSON | undefined {
    const lineJSON = line.toJSON();
    if (!line.to || !line.info.to || !line.toPort) {
      return;
    }
    // 父子节点之间连线，需替换子画布为父节点
    const fromSubCanvas = this.getNodeSubCanvas(line.from);
    const toSubCanvas = this.getNodeSubCanvas(line.to);
    if (fromSubCanvas && !fromSubCanvas.isCanvas && toSubCanvas && toSubCanvas.isCanvas) {
      // 忽略子画布与父节点的连线
      return;
    }
    if (line.from === line.to.parent && fromSubCanvas) {
      return {
        ...lineJSON,
        sourceNodeID: fromSubCanvas.parentNode.id,
      };
    }
    if (line.to === line.from.parent && toSubCanvas) {
      return {
        ...lineJSON,
        targetNodeID: toSubCanvas.parentNode.id,
      };
    }
    return lineJSON;
  }

  private createWorkflowLine(
    json: WorkflowEdgeJSON,
    parentId?: string
  ): WorkflowLineEntity | undefined {
    const fromNode = this.getNode(json.sourceNodeID);
    const toNode = this.getNode(json.targetNodeID);
    // 脏数据清除
    if (!fromNode || !toNode) {
      return;
    }
    const lineInfo: WorkflowLinePortInfo = {
      from: json.sourceNodeID,
      fromPort: json.sourcePortID,
      to: json.targetNodeID,
      toPort: json.targetPortID,
    };
    if (!parentId) {
      return this.linesManager.createLine(lineInfo);
    }
    // 父子节点之间连线，需替换父节点为子画布
    const canvasNode = this.getNode(parentId);
    if (!canvasNode) {
      return this.linesManager.createLine(lineInfo);
    }
    const parentSubCanvas = this.getNodeSubCanvas(canvasNode);
    if (!parentSubCanvas) {
      return this.linesManager.createLine(lineInfo);
    }
    if (lineInfo.from === parentSubCanvas.parentNode.id) {
      return this.linesManager.createLine({
        ...lineInfo,
        from: parentSubCanvas.canvasNode.id,
      });
    }
    if (lineInfo.to === parentSubCanvas.parentNode.id) {
      return this.linesManager.createLine({
        ...lineInfo,
        to: parentSubCanvas.canvasNode.id,
      });
    }
    return this.linesManager.createLine(lineInfo);
  }
}
