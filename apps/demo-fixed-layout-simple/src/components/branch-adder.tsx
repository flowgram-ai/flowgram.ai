import { type FlowNodeEntity, useClientContext } from '@flowgram.ai/fixed-layout-editor';
import { IconPlus } from '@douyinfe/semi-icons';
import { nanoid } from 'nanoid';


interface PropsType {
  activated?: boolean;
  node: FlowNodeEntity;
}


export function BranchAdder(props: PropsType) {
  const { activated, node } = props;
  const nodeData = node.firstChild!.renderData;
  const ctx = useClientContext();
  const { operation, playground } = ctx;
  const { isVertical } = node;

  function addBranch() {
    const block = operation.addBlock(node, {
      id: `branch_${nanoid(5)}`,
      type: 'block',
      data: {
        title: 'New Branch',
        content: ''
      }
    });

    setTimeout(() => {
      playground.scrollToView({
        bounds: block.bounds,
        scrollToCenter: true,
      });
    }, 10);
  }
  if (playground.config.readonlyOrDisabled) return null;

  const className = [
    'demo-fixed-adder',
    isVertical ? '' : 'isHorizontal',
    activated ? 'activated' : ''
  ].join(' ');

  return (
    <div
      className={className}
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
    </div>
  );
}
