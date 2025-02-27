import { FormItemAbility } from '../../models/form-item-ability';

export interface VisibilityAbilityOptions {
  /**
   * 是否隐藏
   */
  hidden: string | boolean;
  /**
   * 隐藏是否要清空表单值, 默认为false
   */
  clearWhenHidden?: boolean;
}

export class VisibilityAbility implements FormItemAbility {
  static readonly type = 'visibility';

  get type(): string {
    return VisibilityAbility.type;
  }
}
