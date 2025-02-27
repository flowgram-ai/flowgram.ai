import { type TransformSchema } from './transform-schema';

export interface NodeSchema {
  id: string;
  name?: string;
}

export interface TransformNodeSchema extends NodeSchema {
  transform: TransformSchema;
}
