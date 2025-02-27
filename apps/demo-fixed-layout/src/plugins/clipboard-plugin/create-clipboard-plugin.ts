import {
  definePluginCreator,
  Disposable,
  FixedLayoutPluginContext,
  PluginCreator,
} from '@flowgram.ai/fixed-layout-editor';

import { readData } from '../../shortcuts/utils';

let disposable: any;

export const createClipboardPlugin: PluginCreator<void> = definePluginCreator<
  void,
  FixedLayoutPluginContext
>({
  async onInit(ctx) {
    const clipboard = ctx.clipboard;
    clipboard.writeText(await readData(clipboard));
    const clipboardListener = (e: any) => {
      clipboard.writeText(e.value);
    };
    navigator.clipboard.addEventListener('onchange', clipboardListener);

    disposable = Disposable.create(() => {
      navigator.clipboard.removeEventListener('onchange', clipboardListener);
    });
  },
  onDispose() {
    disposable?.dispose?.();
    disposable = undefined;
  },
});
