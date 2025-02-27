import { beforeEach, describe, it, expect } from 'vitest';
import { FlowNodeEntity, FlowNodeFormData, FlowNodeJSON, FormModelV2 } from '@flowgram.ai/editor';

import { createHistoryContainer } from '../../create-container';
import { formMock } from '../../../__mocks__/form.mock';
import { emptyMock } from '../../../__mocks__/flow.mock';

describe('history-operation-service changeFormData', () => {
  const { flowDocument, flowOperationService, historyService } = createHistoryContainer({
    fromNodeJSON(node: FlowNodeEntity, json: FlowNodeJSON) {
      const formData = node.getData(FlowNodeFormData)!;
      const formMeta = node.getNodeRegistry()?.formMeta;

      if (formMeta) {
        formData.createForm(formMeta, json.data);
      }
    },
    nodeEngine: {},
    nodeRegistries: [
      {
        type: 'formV2',
        formMeta: formMock,
      },
    ],
  });

  beforeEach(() => {
    flowDocument.fromJSON(emptyMock);
  });

  it('setFormValue', async () => {
    const formNode = flowOperationService.addFromNode('start_0', {
      type: 'formV2',
      id: 'form',
    });

    // TODO 新引擎需要渲染后才会createField, 这里先手动模拟下
    const formModel = formNode?.getData(FlowNodeFormData)?.getFormModel() as FormModelV2;
    formModel.nativeFormModel?.createField('name');

    flowOperationService.setFormValue(formNode, 'name', 'test');
    expect(formNode.toJSON()?.data?.name).toEqual('test');
    await historyService.undo();
    expect(formNode.toJSON()?.data?.name).toEqual(undefined);
  });
});
