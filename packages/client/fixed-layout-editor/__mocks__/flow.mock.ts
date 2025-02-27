import { FlowDocumentJSON } from '../src';

export const emptyMock: FlowDocumentJSON = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      blocks: [],
    },
    {
      id: 'end_0',
      type: 'end',
      blocks: [],
    },
  ],
};

export const formMock: FlowDocumentJSON = {
  nodes: [{
    id: 'noop_0',
    type: 'noop',
    data: {
      title: 'noop title',
    },
    blocks: [],
  }]
}

export const baseWithDataMock: FlowDocumentJSON = {
  nodes: [ {
      id: 'start_0',
      type: 'start',
      data: {
        title: 'start title',
      },
      blocks: [],
    },
    {
      id: 'dynamicSplit_0',
      type: 'dynamicSplit',
      data: {
        title: 'dynamic title',
      },
      blocks: [
        { id: 'block_0', data: { title: '' }, blocks: [], type: 'block' },
        { id: 'block_1',data: { title: '' }, blocks: [], type: 'block'},
        { id: 'block_2',data: { title: '' },blocks: [], type: 'block' }
      ],
    },
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: 'end title',
      },
      blocks: [],
    },
  ]
}

export const baseMock: FlowDocumentJSON = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      blocks: [],
    },
    {
      id: 'dynamicSplit_0',
      type: 'dynamicSplit',
      blocks: [
        { id: 'block_0', data: {}, blocks: [], type: 'block' },
        { id: 'block_1',data: {}, blocks: [], type: 'block'},
        { id: 'block_2',data: {},blocks: [], type: 'block' }
      ],
    },
    {
      id: 'end_0',
      type: 'end',
      blocks: [],
    },
  ],
};

