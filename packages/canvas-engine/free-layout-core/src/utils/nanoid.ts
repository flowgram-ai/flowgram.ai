import { nanoid as nanoidOrigin } from 'nanoid';

export function nanoid(n?: number): string {
  return nanoidOrigin(n);
}
