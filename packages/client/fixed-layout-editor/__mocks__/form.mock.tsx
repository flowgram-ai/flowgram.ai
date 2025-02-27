import {Field, FieldRenderProps, FormMeta, FormRenderProps} from "@flowgram.ai/editor";


export const render = ({ form }: FormRenderProps<FormData>) => {
  return (
    <>
      <Field name="name">
        {({ field: { value, onChange } }: FieldRenderProps<string>) => (
          <>
            <input value={value} onChange={onChange} />
          </>
        )}
      </Field>
    </>
  );
}

export const formMock: FormMeta = {
  render
};
