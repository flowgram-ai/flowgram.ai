import { find, mergeWith } from 'lodash';
import { FormFeedback, FormPathService } from '@flowgram.ai/form-core';
import { FormValidateReturn } from '@flowgram.ai/form/src/types';
import { type FieldModel, FieldName } from '@flowgram.ai/form';

import { EffectOptions } from './types';

export function findMatchedInMap<T = any>(
  field: FieldModel<any>,
  validateMap: Record<FieldName, T> | undefined
): T | undefined {
  if (!validateMap) {
    return;
  }
  if (validateMap[field.name]) {
    return validateMap[field.name];
  }

  const found = find(Object.keys(validateMap), (key) => {
    if (key.startsWith('regex:')) {
      const regex = RegExp(key.split(':')[1]);
      return regex.test(field.name);
    }
    return false;
  });

  if (found) {
    return validateMap[found];
  }
}

export function formFeedbacksToNodeCoreFormFeedbacks(
  formFeedbacks: FormValidateReturn
): FormFeedback[] {
  return formFeedbacks.map(
    (f) =>
      ({
        feedbackStatus: f.level,
        feedbackText: f.message,
        path: f.name,
      } as FormFeedback)
  );
}

export function convertGlobPath(path: string) {
  if (path.startsWith('/')) {
    const parts = FormPathService.normalize(path).slice(1).split('/');
    return parts.join('.');
  }
  return path;
}

export function mergeEffectMap(
  origin: Record<string, EffectOptions[]>,
  source: Record<string, EffectOptions[]>
) {
  return mergeWith(origin, source, function (objValue: EffectOptions[], srcValue: EffectOptions[]) {
    return (objValue || []).concat(srcValue);
  });
}
