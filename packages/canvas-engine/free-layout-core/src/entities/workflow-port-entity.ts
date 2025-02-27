import { type IPoint, Rectangle, Emitter } from '@flowgram.ai/utils';
import {
  Entity,
  type EntityOpts,
  PlaygroundConfigEntity,
  TransformData,
  type EntityRegistry,
} from '@flowgram.ai/core';

import { type WorkflowDocument } from '../workflow-document';
import {
  type WorkflowPortType,
  getPortEntityId,
  WORKFLOW_LINE_ENTITY,
  domReactToBounds,
} from '../utils/statics';
import { type WorkflowNodeMeta } from '../typings';
import { type WorkflowNodeEntity } from './workflow-node-entity';
import { type WorkflowLineEntity } from './workflow-line-entity';

// port 的宽度
export const PORT_SIZE = 24;

export interface WorkflowPort {
  /**
   * 没有代表 默认连接点，默认 input 类型 为最左边中心，output 类型为最右边中心
   */
  portID?: string | number;
  /**
   * 禁用端口
   */
  disabled?: boolean;
  /**
   * 将点位渲染到该父节点上
   */
  targetElement?: HTMLElement;
  /**
   * 输入或者输出点
   */
  type: WorkflowPortType;
}

export type WorkflowPorts = WorkflowPort[];

export interface WorkflowPortEntityOpts extends EntityOpts, WorkflowPort {
  /**
   * port 属于哪个节点
   */
  node: WorkflowNodeEntity;
}

/**
 * Port 抽象的 Entity
 */
export class WorkflowPortEntity extends Entity<WorkflowPortEntityOpts> {
  static type = 'WorkflowPortEntity';

  readonly node: WorkflowNodeEntity;

  targetElement?: HTMLElement;

  readonly portID: string | number = '';

  readonly _disabled: boolean = false;

  private _hasError = false;

  protected readonly _onErrorChangedEmitter = new Emitter<void>();

  onErrorChanged = this._onErrorChangedEmitter.event;

  /**
   * port 类型
   */
  portType: WorkflowPortType;

  static getPortEntityId(
    node: WorkflowNodeEntity,
    portType: WorkflowPortType,
    portID: string | number = ''
  ): string {
    return getPortEntityId(node, portType, portID);
  }

  // relativePosition
  constructor(opts: WorkflowPortEntityOpts) {
    super(opts);
    this.portID = opts.portID || '';
    this.portType = opts.type;
    this._disabled = opts.disabled ?? false;
    this.node = opts.node;
    this.updateTargetElement(opts.targetElement);
    this.toDispose.push(this.node.getData(TransformData)!.onDataChange(() => this.fireChange()));
    this.toDispose.push(this.node.onDispose(this.dispose.bind(this)));
  }

  // 获取连线是否为错误态
  get hasError() {
    return this._hasError;
  }

  // 设置连线的错误态，外部应使用 validate 进行更新
  set hasError(hasError: boolean) {
    this._hasError = hasError;
    this._onErrorChangedEmitter.fire();
  }

  validate() {
    // 一个端口可能连接很多线，需要保证所有的连线都不包含错误
    const anyLineHasError = this.allLines.some((line) => {
      // 忽略已销毁和被隐藏的线
      if (line.disposed || line.isHidden) {
        return false;
      }

      // 保证 hasError 最新
      line.validateSelf();

      return line.hasError;
    });
    // 如果没有连线错误，需校验端口自身错误
    const isPortHasError = (this.node.document as WorkflowDocument).isErrorPort(this);
    this.hasError = anyLineHasError || isPortHasError;
  }

  isErrorPort() {
    return (this.node.document as WorkflowDocument).isErrorPort(this);
  }

  get point(): IPoint {
    const { targetElement } = this;
    const { bounds } = this.node.getData(TransformData)!;
    if (targetElement) {
      const pos = domReactToBounds(targetElement.getBoundingClientRect()).center;
      return this.entityManager
        .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)!
        .getPosFromMouseEvent({
          clientX: pos.x,
          clientY: pos.y,
        });
    }
    if (this.portType === 'input') {
      // 默认为左边重点
      return bounds.leftCenter;
    }
    return bounds.rightCenter;
  }

  /**
   * 点的区域
   */
  get bounds(): Rectangle {
    const { point } = this;
    const halfSize = PORT_SIZE / 2;
    return new Rectangle(point.x - halfSize, point.y - halfSize, PORT_SIZE, PORT_SIZE);
  }

  isHovered(x: number, y: number): boolean {
    return this.bounds.contains(x, y);
  }

  /**
   * 相对节点左上角的位置
   */
  get relativePosition(): IPoint {
    const { point } = this;
    const { bounds } = this.node.getData(TransformData)!;
    return {
      x: point.x - bounds.x,
      y: point.y - bounds.y,
    };
  }

  updateTargetElement(el?: HTMLElement): void {
    if (el !== this.targetElement) {
      this.targetElement = el;
      this.fireChange();
    }
  }

  /**
   * 是否被禁用
   */
  get disabled(): boolean {
    const document = this.node.document as WorkflowDocument;
    if (typeof document.options.isDisabledPort === 'function') {
      return document.options.isDisabledPort(this);
    }
    if (this._disabled) {
      return true;
    }
    const meta = this.node.getNodeMeta<WorkflowNodeMeta>();
    if (this.portType === 'input') {
      return !!meta.inputDisable;
    }
    return !!meta.outputDisable;
  }

  /**
   * 当前点位上连接的线条
   */
  get lines(): WorkflowLineEntity[] {
    return this.allLines.filter((line) => !line.isDrawing);
  }

  /**
   * 当前点位上连接的线条（包含 isDrawing === true 的线条）
   */
  get allLines() {
    const lines: WorkflowLineEntity[] = [];
    // TODO: 后续 sdk 支持 getEntitiesByType 单独根据 type 获取功能后修改
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const allLines = this.entityManager.getEntities<WorkflowLineEntity>({
      type: WORKFLOW_LINE_ENTITY,
    } as EntityRegistry);
    allLines.forEach((line) => {
      // 不包含 drawing 的线条
      if (line.toPort === this || line.fromPort === this) {
        lines.push(line);
      }
    });
    return lines;
  }

  dispose(): void {
    // 点位被删除，对应的线条也要删除
    this.lines.forEach((l) => l.dispose());
    super.dispose();
  }
}
