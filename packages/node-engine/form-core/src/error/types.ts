import { NodeContext, Render } from '../node';

export interface NodeErrorRenderProps {
  error: Error;
  context: NodeContext;
}

export type NodeErrorRender = Render<NodeErrorRenderProps>;
