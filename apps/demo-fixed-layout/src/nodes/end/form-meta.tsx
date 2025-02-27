import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from '@flowgram.ai/fixed-layout-editor';

import { FlowNodeJSON, JsonSchema } from '../../typings';
import { FormHeader, FormContent, FormOutputs, PropertiesEdit } from '../../form-components';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => (
  <>
    <FormHeader />
    <FormContent>
      <Field
        name="outputs.properties"
        render={({
          field: { value, onChange },
          fieldState,
        }: FieldRenderProps<Record<string, JsonSchema>>) => (
          <>
            <PropertiesEdit value={value} onChange={onChange} useFx={true} />
          </>
        )}
      />
      <FormOutputs />
    </FormContent>
  </>
);

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : 'Title is required'),
  },
};
