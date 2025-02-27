export interface FormItemAbility {
  type: string;
  /**
   * 注册到formManager时钩子时调用
   */
  onAbilityRegister?: () => void;
}

export interface AbilityClass {
  type: string;

  new (): FormItemAbility;
}
