import { Disposable } from './disposable';
type EventListener<K extends keyof HTMLElementEventMap> = (
  this: HTMLElement,
  event: HTMLElementEventMap[K],
) => any;
type EventListenerOrEventListenerObject<K extends keyof HTMLElementEventMap> = EventListener<K>;
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: EventListenerOrEventListenerObject<K>,
  useCapture?: boolean,
): Disposable {
  element.addEventListener(type, listener, useCapture);
  return Disposable.create(() => element.removeEventListener(type, listener, useCapture));
}
