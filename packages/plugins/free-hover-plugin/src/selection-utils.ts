import { FlowNodeTransformData, FlowNodeEntity } from '@flowgram.ai/document';
import { type Entity } from '@flowgram.ai/core';
import { Rectangle } from '@flowgram.ai/utils';

const BOUNDS_PADDING = 2;

export function getSelectionBounds(
  selection: Entity[],
  ignoreOneSelect?: boolean, // 忽略单选
): Rectangle {
  const selectedNodes = selection.filter(node => node instanceof FlowNodeEntity);

  if (!selectedNodes?.length) {
    return Rectangle.EMPTY;
  }

  // 选中单个的时候不显示
  if (
    ignoreOneSelect &&
    selectedNodes.length === 1 &&
    // 选中的节点不包含多个子节点
    (selectedNodes[0] as FlowNodeEntity).childrenLength <= 1
  ) {
    return Rectangle.EMPTY;
  }

  return Rectangle.enlarge(selectedNodes.map(n => n.getData(FlowNodeTransformData)!.bounds)).pad(
    BOUNDS_PADDING,
  );
}
