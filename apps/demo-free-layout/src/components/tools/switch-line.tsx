import { useCallback } from 'react';

import { usePlayground, useService, WorkflowLinesManager } from '@flowgram.ai/free-layout-editor';
import { IconButton, Tooltip } from '@douyinfe/semi-ui';

import { IconSwitchLine } from '../../assets/icon-switch-line';

export const SwitchLine = () => {
  const playground = usePlayground();
  const linesManager = useService(WorkflowLinesManager);
  const switchLine = useCallback(() => {
    linesManager.switchLineType();
  }, [linesManager]);

  return (
    <Tooltip content={'Switch Line'}>
      <IconButton
        disabled={playground.config.readonly}
        type="tertiary"
        theme="borderless"
        onClick={switchLine}
        icon={IconSwitchLine}
      />
    </Tooltip>
  );
};
