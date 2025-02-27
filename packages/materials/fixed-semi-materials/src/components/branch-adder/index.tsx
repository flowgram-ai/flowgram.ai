import React from 'react';

import { nanoid } from 'nanoid';
import {
  type FlowNodeEntity,
  FlowNodeRenderData,
  FlowNodeTransformData,
  usePlayground,
  useService,
  FlowOperationService,
} from '@flowgram.ai/fixed-layout-editor';
import { IconPlus } from '@douyinfe/semi-icons';

import { Container } from './styles';

interface PropsType {
  activated?: boolean;
  node: FlowNodeEntity;
}

export default function BranchAdder(props: PropsType) {
  const { activated, node } = props;
  const nodeData = node.firstChild?.getData<FlowNodeRenderData>(FlowNodeRenderData);
  const playground = usePlayground();
  const flowOperationService = useService(FlowOperationService) as FlowOperationService;
  const { isVertical } = node;

  function addBranch() {
    const block = flowOperationService.addBlock(node, { id: nanoid(5) });

    setTimeout(() => {
      playground.scrollToView({
        bounds: block.getData<FlowNodeTransformData>(FlowNodeTransformData)!.bounds,
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
