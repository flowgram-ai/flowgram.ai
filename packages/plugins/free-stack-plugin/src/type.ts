import type { Entity } from '@flowgram.ai/core';
import type { WorkfloEntityHoverable } from '@flowgram.ai/free-layout-core';

export type StackingContext = {
  hoveredEntity?: WorkfloEntityHoverable;
  hoveredEntityID?: string;
  selectedEntities: Entity[];
  selectedIDs: string[];
};
