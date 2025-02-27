import { useObserve } from '@flowgram.ai/reactive';

import { Form, FormControl, FormState } from '../types';

export function useFormState(control?: FormControl<any> | Form) {
  // @ts-ignore
  return useObserve<FormState>(control?._formModel.reactiveState.value || ({} as FormState));
}

export function useFormErrors(control?: FormControl<any> | Form) {
  // @ts-ignore
  return useObserve<FormState>(control?._formModel.reactiveState.value || ({} as FormState))
    ?.errors;
}

export function useFormWarnings(control?: FormControl<any> | Form) {
  // @ts-ignore
  return useObserve<FormState>(control?._formModel.reactiveState.value || ({} as FormState))
    ?.warnings;
}
