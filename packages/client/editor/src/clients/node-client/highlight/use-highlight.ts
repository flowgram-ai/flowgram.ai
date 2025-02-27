import { useRef } from 'react';

import { FormModel } from '@flowgram.ai/form-core';

interface HighlightProps {
  form: FormModel;
  path: string;
}

export function useHighlight(props: HighlightProps) {
  const ref = useRef<any>(null);
  const { form, path } = props;
  const formItem = form.getFormItemByPath(path);
  if (!formItem) {
    return null;
  }
  formItem.domRef = ref;
  return ref;
}
