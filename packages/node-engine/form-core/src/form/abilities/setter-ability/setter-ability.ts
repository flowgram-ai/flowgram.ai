import { FormItemAbility } from '../../models/form-item-ability';

export class SetterAbility implements FormItemAbility {
  static readonly type = 'setter';

  get type(): string {
    return SetterAbility.type;
  }
}
