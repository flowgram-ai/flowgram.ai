import { Tooltip, IconButton } from '@douyinfe/semi-ui';

import { UIIconGridRectangle } from './styles';

export const MinimapSwitch = (props: {
  minimapVisible: boolean;
  setMinimapVisible: (visible: boolean) => void;
}) => {
  const { minimapVisible, setMinimapVisible } = props;

  return (
    <Tooltip content="Minimap">
      <IconButton
        theme="borderless"
        icon={<UIIconGridRectangle visible={minimapVisible} />}
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
