import {
  EditorRenderer,
  FreeLayoutEditorProvider,
} from '@flowgram.ai/free-layout-editor';

import { NodeAddPanel } from './components/node-add-panel';
import { Tools } from './components/tools'
import { Minimap } from './components/minimap'
import { useEditorProps } from './hooks/use-editor-props'
import '@flowgram.ai/free-layout-editor/index.css';
import './index.css';

export const Editor = () => {
  const editorProps = useEditorProps()
  return (
    <FreeLayoutEditorProvider {...editorProps}>
      <div className="demo-free-container">
        <div className="demo-free-layout">
          <NodeAddPanel />
          <EditorRenderer className="demo-free-editor" />
        </div>
        <Tools />
        <Minimap />
      </div>
    </FreeLayoutEditorProvider>
  )
};
