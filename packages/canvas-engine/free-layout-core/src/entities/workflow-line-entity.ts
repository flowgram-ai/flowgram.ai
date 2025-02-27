import { isEqual } from 'lodash-es';
import { domUtils, type IPoint, Rectangle } from '@flowgram.ai/utils';
import { Entity, type EntityOpts } from '@flowgram.ai/core';

import { type WorkflowLinesManager } from '../workflow-lines-manager';
import { type WorkflowDocument } from '../workflow-document';
import { WORKFLOW_LINE_ENTITY } from '../utils/statics';
import { LineRenderType, type LinePosition } from '../typings/workflow-line';
import { type WorkflowEdgeJSON } from '../typings';
import { WorkflowNodePortsData } from '../entity-datas/workflow-node-ports-data';
import { WorkflowLineRenderData } from '../entity-datas';
import { type WorkflowPortEntity } from './workflow-port-entity';
import { type WorkflowNodeEntity } from './workflow-node-entity';

export const LINE_HOVER_DISTANCE = 8; // 线条 hover 的最小检测距离
export const POINT_RADIUS = 10;

export interface WorkflowLinePortInfo {
  from: string; // 前置节点 id
  to?: string; // 后置节点 id
  fromPort?: string | number; // 连线的 port 位置
  toPort?: string | number; // 连线的 port 位置
}

export interface WorkflowLineEntityOpts extends EntityOpts, WorkflowLinePortInfo {
  document: WorkflowDocument;
  linesManager: WorkflowLinesManager;
  drawingTo?: IPoint;
}

export interface WorkflowLineInfo extends WorkflowLinePortInfo {
  drawingTo?: IPoint; // 正在画中的元素
  isDefaultLine?: boolean; // 是否为默认的线
  highlightColor?: string; // 高亮显示
}

/**
 * 线条
 */
export class WorkflowLineEntity extends Entity<WorkflowLineEntityOpts> {
  static type = WORKFLOW_LINE_ENTITY;

  /**
   * 转成线条 id
   * @param info
   */
  static portInfoToLineId(info: WorkflowLinePortInfo): string {
    const { from, to, fromPort, toPort } = info;
    return `${from}_${fromPort || ''}-${to || ''}_${toPort || ''}`;
  }

  readonly document: WorkflowDocument;

  readonly linesManager: WorkflowLinesManager;

  private _from: WorkflowNodeEntity;

  private _to?: WorkflowNodeEntity;

  private _processing = false;

  private _hasError = false;

  /**
   * 线条数据
   */
  info: WorkflowLineInfo = {
    from: '',
  };

  readonly isDrawing: boolean;

  /**
   * 线条 Portal 挂载的 div
   */
  private _node?: HTMLDivElement;

  constructor(opts: WorkflowLineEntityOpts) {
    super(opts);
    this.document = opts.document;
    this.linesManager = opts.linesManager;
    // 初始化
    this.initInfo({
      from: opts.from,
      to: opts.to,
      drawingTo: opts.drawingTo,
      fromPort: opts.fromPort,
      toPort: opts.toPort,
    });
    if (opts.drawingTo) {
      this.isDrawing = true;
    }
    // this.onDispose(() => {
    // this._infoDispose.dispose();
    // });
  }

  /**
   * 获取线条的前置节点
   */
  get from(): WorkflowNodeEntity {
    return this._from;
  }

  /**
   * 获取线条的后置节点
   */
  get to(): WorkflowNodeEntity | undefined {
    return this._to;
  }

  get isHidden(): boolean {
    return this.highlightColor === this.linesManager.lineColor.hidden;
  }

  get inContainer(): boolean {
    const nodeInContainer = (node?: WorkflowNodeEntity) =>
      !!node?.parent && node.parent.flowNodeType !== 'root';
    return nodeInContainer(this.from) || nodeInContainer(this.to);
  }

  /**
   * 获取是否 testrun processing
   */
  get processing(): boolean {
    return this._processing;
  }

  /**
   * 设置 testrun processing 状态
   */
  set processing(status: boolean) {
    if (this._processing !== status) {
      this._processing = status;
      this.fireChange();
    }
  }

  // 获取连线是否为错误态
  get hasError() {
    return this._hasError;
  }

  // 设置连线的错误态
  set hasError(hasError: boolean) {
    if (this._hasError !== hasError) {
      this._hasError = hasError;
      this.fireChange();
    }
    if (this._node) {
      this._node.dataset.hasError = this.hasError ? 'true' : 'false';
    }
  }

  /**
   * 设置线条的后置节点
   */
  setToPort(toPort?: WorkflowPortEntity) {
    // 只有绘制中的线条才允许设置 port, 主要用于吸附到点
    if (!this.isDrawing) {
      throw new Error('[setToPort] only support drawing line.');
    }
    if (this.toPort === toPort) {
      return;
    }
    if (
      toPort &&
      toPort.portType === 'input' &&
      this.linesManager.canAddLine(this.fromPort, toPort, true)
    ) {
      const { node, portID } = toPort;
      this._to = node;
      this.info.drawingTo = undefined;
      this.info.isDefaultLine = false;
      this.info.to = node.id;
      this.info.toPort = portID;
    } else {
      this._to = undefined;
      this.info.to = undefined;
      this.info.toPort = '';
    }
    this.fireChange();
  }

  /**
   * 设置线条画线时的目标位置
   */
  set drawingTo(pos: IPoint | undefined) {
    const oldDrawingTo = this.info.drawingTo;
    if (!pos) {
      this.info.drawingTo = undefined;
      this.fireChange();
      return;
    }
    if (!oldDrawingTo || pos.x !== oldDrawingTo.x || pos.y !== oldDrawingTo.y) {
      this.info.to = undefined;
      this.info.isDefaultLine = false;
      this.info.drawingTo = pos;
      this.fireChange();
    }
  }

  /**
   * 获取线条正在画线的位置
   */
  get drawingTo(): IPoint | undefined {
    return this.info.drawingTo;
  }

  get highlightColor(): string {
    return this.info.highlightColor || '';
  }

  set highlightColor(color) {
    if (this.info.highlightColor !== color) {
      this.info.highlightColor = color;
      this.fireChange();
    }
  }

  /**
   * 获取线条的边框位置大小
   */
  get bounds(): Rectangle {
    return this.getData(WorkflowLineRenderData).bounds;
  }

  /**
   * 获取点和线最接近的距离
   */
  getHoverDist(pos: IPoint): number {
    return this.getData(WorkflowLineRenderData).calcDistance(pos);
  }

  get fromPort(): WorkflowPortEntity {
    return this.from
      .getData(WorkflowNodePortsData)
      .getPortEntityByKey('output', this.info.fromPort);
  }

  get toPort(): WorkflowPortEntity | undefined {
    if (!this.to) {
      return undefined;
    }
    return this.to.getData(WorkflowNodePortsData).getPortEntityByKey('input', this.info.toPort);
  }

  /**
   * 获取线条真实的输入输出节点坐标
   */
  get position(): LinePosition {
    return this.getData(WorkflowLineRenderData).position;
  }

  /** 是否反转箭头 */
  get reverse(): boolean {
    return this.linesManager.isReverseLine(this);
  }

  /** 是否隐藏箭头 */
  get hideArrow(): boolean {
    return this.linesManager.isHideArrowLine(this);
  }

  /** 是否流动 */
  get flowing(): boolean {
    return this.linesManager.isFlowingLine(this);
  }

  /** 是否禁用 */
  get disabled(): boolean {
    return this.linesManager.isDisabledLine(this);
  }

  /** 是否竖向 */
  get vertical(): boolean {
    return this.linesManager.isVerticalLine(this);
  }

  /** 获取线条渲染器类型 */
  get renderType(): LineRenderType | undefined {
    return this.linesManager.setLineRenderType(this);
  }

  /** 获取线条样式 */
  get className(): string | undefined {
    return this.linesManager.setLineClassName(this) ?? '';
  }

  get color(): string | undefined {
    return this.linesManager.getLineColor(this);
  }

  /**
   * 初始化线条
   * @param info 线条信息
   */
  protected initInfo(info: WorkflowLineInfo): void {
    if (!isEqual(info, this.info)) {
      this.info = info;
      this._from = this.document.getNode(info.from)!;
      this._to = info.to ? this.document.getNode(info.to) : undefined;
      this.fireChange();
    }
  }

  // 校验连线是否为错误态
  validate() {
    const { fromPort, toPort } = this;
    this.validateSelf();
    fromPort?.validate();
    toPort?.validate();
  }

  validateSelf() {
    const { fromPort, toPort } = this;

    if (fromPort) {
      this.hasError = this.linesManager.isErrorLine(fromPort, toPort);
    }
  }

  is(line: WorkflowLineEntity | WorkflowLinePortInfo): boolean {
    if (line instanceof WorkflowLineEntity) {
      return this === line;
    }
    return WorkflowLineEntity.portInfoToLineId(line as WorkflowLinePortInfo) === this.id;
  }

  canRemove(newLineInfo?: Required<WorkflowLinePortInfo>): boolean {
    return this.linesManager.canRemove(this, newLineInfo);
  }

  get node(): HTMLDivElement {
    if (this._node) return this._node;
    this._node = domUtils.createDivWithClass('gedit-flow-activity-line');
    this._node.dataset.testid = 'sdk.workflow.canvas.line';
    this._node.dataset.lineId = this.id;
    this._node.dataset.fromNodeId = this.from.id;
    this._node.dataset.fromPortId = this.fromPort?.id ?? '';
    this._node.dataset.toNodeId = this.to?.id ?? '';
    this._node.dataset.toPortId = this.toPort?.id ?? '';
    this._node.dataset.hasError = this.hasError ? 'true' : 'false';
    return this._node;
  }

  toJSON(): WorkflowEdgeJSON {
    const json = {
      sourceNodeID: this.info.from,
      targetNodeID: this.info.to!,
      sourcePortID: this.info.fromPort,
      targetPortID: this.info.toPort,
    };
    if (!json.sourcePortID) {
      delete json.sourcePortID;
    }
    if (!json.targetPortID) {
      delete json.targetPortID;
    }
    return json;
  }

  /** 触发线条渲染 */
  fireRender(): void {
    this.fireChange();
  }
}
