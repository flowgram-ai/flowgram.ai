import { type FormManager } from './services/form-manager';

export const FormContribution = Symbol('FormContribution');

export interface FormContribution {
  onRegister?(formManager: FormManager): void;
}
