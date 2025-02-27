import { FormItemAbility } from '../../models/form-item-ability';

export class DefaultAbility implements FormItemAbility {
  static readonly type = 'default';

  get type(): string {
    return DefaultAbility.type;
  }
}
