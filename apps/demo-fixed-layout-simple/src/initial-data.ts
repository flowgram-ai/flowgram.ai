import { FlowDocumentJSON } from '@flowgram.ai/fixed-layout-editor';

/**
 * 配置流程数据，数据为 blocks 嵌套的格式
 */
export const initialData: FlowDocumentJSON = {
  nodes: [
    // 开始节点
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: 'Start',
        content: 'start content'
      },
      blocks: [],
    },
    // 分支节点
    {
      id: 'condition_0',
      type: 'condition',
      data: {
        title: 'Condition'
      },
      blocks: [
        {
          id: 'branch_0',
          type: 'block',
          data: {
            title: 'Branch 0',
            content: 'branch 1 content'
          },
          blocks: [
            {
              id: 'custom_0',
              type: 'custom',
              data: {
                title: 'Custom',
                content: 'custrom content'
              },
            },
          ],
        },
        {
          id: 'branch_1',
          type: 'block',
          data: {
            title: 'Branch 1',
            content: 'branch 1 content'
          },
          blocks: [],
        },
      ],
    },
    // 结束节点
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: 'End',
        content: 'end content'
      },
    },
  ],
};

