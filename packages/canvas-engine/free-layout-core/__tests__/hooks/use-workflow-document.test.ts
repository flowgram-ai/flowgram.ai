import { renderHook } from '@testing-library/react-hooks';

import { createDocument, createHookWrapper } from '../mocks';
import { useWorkflowDocument } from '../../src';

describe('use-workflow-document', () => {
  it('base', async () => {
    const { container, document } = await createDocument();
    const wrapper = createHookWrapper(container);
    const { result } = renderHook(() => useWorkflowDocument(), {
      wrapper,
    });
    expect(result.current).toEqual(document);
  });
});
