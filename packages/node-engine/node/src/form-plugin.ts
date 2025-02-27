import { nanoid } from 'nanoid';
import { Disposable } from '@flowgram.ai/utils';

import { EffectOptions, FormPluginCtx } from './types';
import { FormModelV2 } from './form-model-v2';

export interface FormPluginConfig<Opts = any> {
  /**
   * FormModel 初始化时执行
   * @param ctx
   */
  onInit?: (ctx: FormPluginCtx, opts: Opts) => void;

  /**
   * 同 FormMeta 中的effects 会与 FormMeta 中的effects 合并
   */
  effect?: Record<string, EffectOptions[]>;
  /**
   * FormModel 销毁时执行
   * @param ctx
   */
  onDispose?: (ctx: FormPluginCtx, opts: Opts) => void;
}

export class FormPlugin<Opts = any> implements Disposable {
  readonly name: string;

  readonly pluginId: string;

  readonly config: FormPluginConfig;

  readonly opts?: Opts;

  protected _formModel: FormModelV2;

  constructor(name: string, config: FormPluginConfig, opts?: Opts) {
    this.name = name;
    this.pluginId = `${name}__${nanoid()}`;
    this.config = config;
    this.opts = opts;
  }

  get formModel(): FormModelV2 {
    return this._formModel;
  }

  get ctx() {
    return {
      formModel: this.formModel,
      node: this.formModel.nodeContext.node,
      playgroundContext: this.formModel.nodeContext.playgroundContext,
    };
  }

  init(formModel: FormModelV2) {
    this._formModel = formModel;
    this.config?.onInit?.(this.ctx, this.opts);
  }

  dispose() {
    if (this.config?.onDispose) {
      this.config?.onDispose(this.ctx, this.opts);
    }
  }
}

export function defineFormPluginCreator<Opts>(name: string, config: FormPluginConfig) {
  return function (opts: Opts) {
    return new FormPlugin(name, config, opts);
  };
}
