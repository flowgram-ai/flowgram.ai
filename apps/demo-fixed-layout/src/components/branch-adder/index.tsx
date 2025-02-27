import { type FlowNodeEntity, useClientContext } from '@flowgram.ai/fixed-layout-editor';
import { IconPlus } from '@douyinfe/semi-icons';

import { BlockNodeRegistry } from '../../nodes/block';
import { Container } from './styles';

interface PropsType {
  activated?: boolean;
  node: FlowNodeEntity;
}

export default function BranchAdder(props: PropsType) {
  const { activated, node } = props;
  const nodeData = node.firstChild!.renderData;
  const ctx = useClientContext();
  const { operation, playground } = ctx;
  const { isVertical } = node;

  function addBranch() {
    const block = operation.addBlock(node, BlockNodeRegistry.onAdd!(ctx, node));

    setTimeout(() => {
      playground.scrollToView({
        bounds: block.bounds,
        scrollToCenter: true,
      });
    }, 10);
  }
  if (playground.config.readonlyOrDisabled) return null;

  return (
    <Container
      isVertical={isVertical}
      activated={activated}
      onMouseEnter={() => nodeData?.toggleMouseEnter()}
      onMouseLeave={() => nodeData?.toggleMouseLeave()}
    >
      <div
        onClick={() => {
          addBranch();
        }}
        aria-hidden="true"
        style={{ flexGrow: 1, textAlign: 'center' }}
      >
        <IconPlus />
      </div>
    </Container>
  );
}
