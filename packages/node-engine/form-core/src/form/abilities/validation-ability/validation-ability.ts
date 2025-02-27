import { FormItemAbility } from '../../models/form-item-ability';

export class ValidationAbility implements FormItemAbility {
  static readonly type = 'validation';

  get type(): string {
    return ValidationAbility.type;
  }
}
