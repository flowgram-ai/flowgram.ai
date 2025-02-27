import { isNil } from 'lodash';
export const isHidden = (dom: HTMLElement) => {
  const style = window.getComputedStyle(dom);
  return isNil(dom?.offsetParent) || style?.display === 'none';
};

export const isRectInit = (rect?: DOMRect): boolean => {
  if (!rect) {
    return false;
  }
  // 检查所有属性是否都为0,表示DOMRect未初始化
  if (
    rect.bottom === 0 &&
    rect.height === 0 &&
    rect.left === 0 &&
    rect.right === 0 &&
    rect.top === 0 &&
    rect.width === 0 &&
    rect.x === 0 &&
    rect.y === 0
  ) {
    return false;
  }
  return true;
};
