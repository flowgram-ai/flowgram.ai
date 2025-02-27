export function isReactChangeEvent(e: unknown): e is React.ChangeEvent<HTMLInputElement> {
  return (
    typeof e === 'object' &&
    e !== null &&
    'target' in e &&
    typeof (e as React.ChangeEvent<any>).target === 'object'
  );
}

export function isCheckBoxEvent(e: unknown): e is React.ChangeEvent<HTMLInputElement> {
  return (
    typeof e === 'object' &&
    e !== null &&
    'target' in e &&
    typeof (e as React.ChangeEvent<HTMLInputElement>).target === 'object' &&
    (e as React.ChangeEvent<HTMLInputElement>).target.type === 'checkbox'
  );
}
