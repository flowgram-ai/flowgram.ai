import { describe, it, expect, beforeEach } from 'vitest';
import { FlowDocument, FlowNodeFormData } from '@flowgram.ai/editor';

import { baseWithDataMock, formMock } from '../__mocks__/flow.mock';
import { createContainer } from './create-container';

describe('fixed-layout-preset', () => {
  let flowDocument: FlowDocument;
  beforeEach(() => {
    const container = createContainer({});
    flowDocument = container.get(FlowDocument);
  });
  it('fromJSON and toJSON', () => {
    flowDocument.fromJSON(baseWithDataMock);
    expect(flowDocument.toJSON()).toEqual(baseWithDataMock);
  });
  it('nodeEngine(v2) toJSON', async () => {
    const container = createContainer({
      nodeEngine: {},
      nodeRegistries: [
        {
          type: 'noop',
          formMeta: {
            render: () => undefined,
          },
        },
      ],
    });
    flowDocument = container.get(FlowDocument);
    flowDocument.fromJSON(formMock);
    expect(flowDocument.toJSON()).toEqual(formMock);
    const { formModel } = flowDocument.getNode('noop_0').getData(FlowNodeFormData);
    expect(formModel.getFormItemByPath('title').value).toEqual('noop title');
    formModel.getFormItemByPath('title').value = 'noop title2';
    expect(flowDocument.toJSON()).toMatchSnapshot();
  });
});
