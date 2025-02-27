import styled from 'styled-components';

// 添加一个固定类名，用于选中该节点

export const LineStyle = styled.div.attrs({
  className: 'gedit-flow-activity-edge',
})`
  position: absolute;

  @keyframes flowingDash {
    to {
      stroke-dashoffset: -13;
    }
  }

  .dashed-line {
    stroke-dasharray: 8, 5;
  }

  .flowing-line {
    animation: flowingDash 0.5s linear infinite;
  }
`;
