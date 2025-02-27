import { vi } from 'vitest';

import { createPlayground } from '../__mocks__/playground-container.mock';

it('selectionService', () => {
  const playground = createPlayground();
  const selection = playground.selectionService;

  const onSelectionCallback = vi.fn();
  selection.onSelectionChanged(onSelectionCallback);
  const selectEntities = [playground.config];
  selection.selection = selectEntities;
  expect(selection.selection).toEqual(selectEntities);
  expect(onSelectionCallback.mock.calls[0]).toEqual([selectEntities]);
});
