import { useContext } from 'react';

import { FormModel } from '../core/form-model';
import { FormModelContext } from './context';

export function useFormModel(): FormModel {
  return useContext<FormModel>(FormModelContext);
}
