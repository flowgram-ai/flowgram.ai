import { Subscription } from 'rxjs';
import { Disposable } from '@flowgram.ai/utils';

export function subsToDisposable(subscription: Subscription): Disposable {
  return Disposable.create(() => subscription.unsubscribe());
}
