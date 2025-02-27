import { get } from 'lodash';

import { shallowSetIn } from '../utils';
import { FieldValue } from '../types/field';
import { Path } from './path';

export class Store<TValues = FieldValue> {
  protected _values: TValues;

  get values() {
    return this._values;
  }

  set values(v) {
    this._values = v;
  }

  setInitialValues<TValue = FieldValue>(values: TValues) {
    this._values = values;
  }

  setIn<TValue = FieldValue>(path: Path, value: TValue): void {
    // shallow clone set
    this._values = shallowSetIn(this._values || {}, path.toString(), value);
  }

  getIn<TValue = FieldValue>(path: Path): TValue {
    return get(this._values, path.value);
  }

  dispose() {}
}
