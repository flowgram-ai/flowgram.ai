import 'reflect-metadata';
import { FormModelV2 } from '@flowgram.ai/node';

/* 核心 模块导出 */
export * from '@flowgram.ai/utils';
export * from '@flowgram.ai/core';
export * from '@flowgram.ai/document';
export * from '@flowgram.ai/renderer';
export * from '@flowgram.ai/variable-plugin';
export * from '@flowgram.ai/shortcuts-plugin';
export * from '@flowgram.ai/node-core-plugin';
export * from '@flowgram.ai/i18n-plugin';

export { FlowNodeFormData, NodeRender, type NodeRenderProps } from '@flowgram.ai/form-core';

export type {
  FormState,
  FieldState,
  FieldArrayRenderProps,
  FieldRenderProps,
  FormRenderProps,
  Validate,
  FormControl,
  FieldName,
  FieldError,
  FieldWarning,
  IField,
  IFieldArray,
} from '@flowgram.ai/form';

export {
  Form,
  Field,
  FieldArray,
  useForm,
  useField,
  useCurrentField,
  useCurrentFieldState,
  useFieldValidate,
  useWatch,
  ValidateTrigger,
} from '@flowgram.ai/form';
export * from '@flowgram.ai/node';
export { FormModelV2 as FormModel };

/**
 * 固定布局模块导出
 */
export * from './preset';
export * from './components';
export * from './hooks';
export * from './clients';

/**
 * Plugin 导出
 */

export * from '@flowgram.ai/node-variable-plugin';
