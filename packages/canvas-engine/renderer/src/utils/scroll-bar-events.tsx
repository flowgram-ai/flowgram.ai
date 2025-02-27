/**
 * 滚动条点击事件监听
 */
export const ScrollBarEvents = Symbol('ScrollBarEvents');

export interface ScrollBarEvents {
  dragStart: () => void;
}
