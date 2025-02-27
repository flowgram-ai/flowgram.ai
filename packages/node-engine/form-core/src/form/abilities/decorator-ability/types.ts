import { FormItemContext, FormItemFeedback } from '../../types';
import { SetterOrDecoratorContext } from '../../abilities/setter-ability';

export interface DecoratorAbilityOptions {
  /**
   * 已注册的decorator的唯一标识
   */
  key: string;
}

export interface DecoratorComponentProps<CustomOptions = any>
  extends FormItemFeedback,
    FormItemContext {
  readonly: boolean;
  children?: any;
  options: DecoratorAbilityOptions & CustomOptions;
  context: SetterOrDecoratorContext;
}

export interface DecoratorExtension {
  key: string;
  component: (props: DecoratorComponentProps) => any;
}
