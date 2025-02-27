import { useMemo } from 'react';

import { useDark } from '@rspress/core/runtime';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFiles,
  // SandpackPreview,
} from '@codesandbox/sandpack-react';

export const PreviewEditor = ({
  files,
  children,
  previewStyle,
  dependencies,
  editorStyle,
}: {
  files: SandpackFiles;
  children: JSX.Element;
  previewStyle?: React.CSSProperties;
  dependencies?: Record<string, string>;
  editorStyle?: React.CSSProperties;
}) => {
  const dark = useDark();
  const theme = useMemo(() => (dark ? 'dark' : 'light'), [dark]);

  return (
    <SandpackProvider
      template="react"
      theme={theme}
      customSetup={{
        dependencies,
      }}
      files={files}
      onChange={(v) => {
        console.log('debugger', v);
      }}
    >
      <SandpackLayout style={previewStyle}>
        {children}
        {/* <SandpackPreview /> */}
      </SandpackLayout>
      <SandpackLayout>
        <SandpackCodeEditor style={editorStyle} readOnly />
      </SandpackLayout>
    </SandpackProvider>
  );
};
