import { UserWheelConfig, Handler, EventTypes } from '../core/types';
import { registerAction, wheelAction } from '../core/actions';
import { Recognizer } from './Recognizer';

interface WheelGestureConstructor {
  new <EventType = EventTypes['wheel']>(
    target: EventTarget,
    handler: Handler<'wheel', EventType>,
    config?: UserWheelConfig,
  ): WheelGesture;
}

export interface WheelGesture extends Recognizer<'wheel'> {}

export const WheelGesture: WheelGestureConstructor = function <EventType = EventTypes['wheel']>(
  target: EventTarget,
  handler: Handler<'wheel', EventType>,
  config?: UserWheelConfig,
) {
  registerAction(wheelAction);
  return new Recognizer(target, { wheel: handler }, config || {}, 'wheel');
} as any;
