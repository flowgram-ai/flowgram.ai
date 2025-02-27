import { FormItemContext, FormItemMaterialContext } from '../..';

export interface GetDefaultValueProps extends FormItemContext {
  options: DefaultAbilityOptions;
  context: FormItemMaterialContext;
}

export interface DefaultAbilityOptions<T = any> {
  getDefaultValue: (params: GetDefaultValueProps) => T;
}
