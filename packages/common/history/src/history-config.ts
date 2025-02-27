import { nanoid } from 'nanoid';
import { injectable } from 'inversify';

@injectable()
export class HistoryConfig {
  generateId: () => string = () => nanoid();

  getSnapshot: () => unknown = () => '';
}
