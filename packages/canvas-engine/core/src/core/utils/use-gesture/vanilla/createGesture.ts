import { Action, GestureHandlers, UserGestureConfig } from '../core/types';
import { registerAction } from '../core/actions';
import { parseMergedHandlers } from '../core';
import { Recognizer } from './Recognizer';

export function createGesture(actions: Action[]) {
  actions.forEach(registerAction);

  return function (target: EventTarget, _handlers: GestureHandlers, _config?: UserGestureConfig) {
    const { handlers, nativeHandlers, config } = parseMergedHandlers(_handlers, _config || {});
    return new Recognizer(target, handlers, config, undefined, nativeHandlers);
  };
}
