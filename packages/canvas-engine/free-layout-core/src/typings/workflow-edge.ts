/**
 * 边数据
 */
export interface WorkflowEdgeJSON {
  sourceNodeID: string;
  targetNodeID: string;
  sourcePortID?: string | number;
  targetPortID?: string | number;
}
