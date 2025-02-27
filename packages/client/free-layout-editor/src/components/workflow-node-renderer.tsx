import React from 'react';

import clx from 'clsx';
import { WorkflowPortRender } from '@flowgram.ai/free-lines-plugin';
import {
  WorkflowNodeEntity,
  useNodeRender,
  WorkflowPortEntity,
} from '@flowgram.ai/free-layout-core';

export interface WorkflowNodeProps {
  node: WorkflowNodeEntity;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | null;
  portClassName?: string;
  portStyle?: React.CSSProperties;
  onPortClick?: (
    port: WorkflowPortEntity,
    e: React.MouseEvent<HTMLDivElement> | React.MouseEventHandler<HTMLDivElement>
  ) => void;
}

export const WorkflowNodeRenderer: React.FC<WorkflowNodeProps> = (props) => {
  const { selected, activated, startDrag, ports, selectNode, nodeRef, onFocus, onBlur } =
    useNodeRender();
  const className = clx(props.className || '', {
    activated,
    selected,
  });
  return (
    <>
      <div
        className={className}
        style={props.style}
        ref={nodeRef}
        draggable
        onDragStart={startDrag}
        onClick={selectNode}
        onFocus={onFocus}
        onBlur={onBlur}
        data-node-selected={String(selected)}
      >
        {props.children}
      </div>
      {ports.map((p) => (
        <WorkflowPortRender
          key={p.id}
          entity={p}
          onClick={props.onPortClick ? (e) => props.onPortClick!(p, e) : undefined}
          className={props.portClassName}
          style={props.portStyle}
        />
      ))}
    </>
  );
};
