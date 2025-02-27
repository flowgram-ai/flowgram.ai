import { Emitter } from '@flowgram.ai/utils';

interface Payload<T> {
  origin?: T;
  current?: T;
}

export class EmitterChain<T> {
  protected emitter: Emitter<Payload<T>>;

  constructor() {
    this.emitter = new Emitter<Payload<T>>();
  }

  get event() {
    return this.emitter.event;
  }

  _fire(current?: T, origin?: T) {
    this.emitter.fire({ current, origin });
  }

  fire(current: T, next?: EmitterChain<T>) {
    this._fire(current);
    next?._fire(undefined, current);
  }
}
