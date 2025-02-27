import { EntityData } from '@flowgram.ai/core';

export interface ErrorData {
  error: Error | null;
}

export class FlowNodeErrorData extends EntityData {
  static type = 'FlowNodeErrorData';

  getDefaultData(): ErrorData {
    return { error: null };
  }

  setError(e: ErrorData['error']) {
    this.update({ error: e });
  }

  getError(): Error {
    return this.data.error;
  }
}
