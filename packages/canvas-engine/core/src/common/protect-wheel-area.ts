/**
 * 保护区域不被画布劫持滚动事件
 */
export const ProtectWheelArea = Symbol('ProtectWheelArea');

export type ProtectWheelArea = (dom: Element) => boolean;
