import { describe, test, expect } from 'vitest';

import { Disposable, DisposableCollection, DisposableImpl } from './disposable';

describe('disposable', () => {
  test('Disposable', async () => {
    const disposable: Disposable = {
      dispose() {},
    };
    expect(disposable.dispose()).toBeUndefined();

    expect(Disposable.is(disposable)).toBeTruthy();
    expect(Disposable.NULL.dispose()).toBeUndefined();
    expect(Disposable.create(() => {}).dispose()).toBeUndefined();
  });

  test('DisposableCollection', async () => {
    let dispose1Times = 0;
    let dispose3Times = 0;
    let disposeAllTimes = 0;
    const execSort: string[] = [];
    const disposable1: Disposable = {
      dispose() {
        dispose1Times += 1;
        execSort.push('1');
      },
    };
    const disposable2: Disposable = {
      dispose() {
        execSort.push('2');
        throw new Error('[ignore] disposable2 error');
      },
    };
    const disposable3: Disposable = {
      dispose() {
        dispose3Times += 1;
        execSort.push('3');
      },
    };
    const dc = new DisposableCollection(disposable1);
    dc.onDispose(() => {
      disposeAllTimes += 1;
      execSort.push('all');
    });
    dc.pushAll([disposable1, disposable2]); // disposable1 add twice;
    const dispose3Remove = dc.push(disposable3);
    dispose3Remove.dispose(); // remove;

    dc.dispose();
    expect(dispose1Times).toEqual(1);
    expect(dispose3Times).toEqual(0);
    expect(disposeAllTimes).toEqual(1);
    expect(dc.disposed).toBeTruthy();

    // readd
    dc.push(disposable1);

    // dupilicate dispose
    dc.dispose();
    expect(dispose1Times).toEqual(1);
    expect(dispose3Times).toEqual(0);
    expect(disposeAllTimes).toEqual(1);
    expect(dc.disposed).toBeTruthy();
    expect(execSort).toEqual(['2', '1', 'all']);
  });
  test('DisposableCololection dispose inside', () => {
    let dispose1Times = 0;
    let disposeAllTimes = 0;
    const dc = new DisposableCollection();
    const disposable1: Disposable = {
      dispose() {
        dc.dispose(); // dispose inside
        dispose1Times += 1;
      },
    };
    dc.onDispose(() => {
      dc.dispose(); // dispose inside
      disposeAllTimes += 1;
    });
    dc.push(disposable1);

    dc.dispose();
    expect(dispose1Times).toEqual(1);
    expect(disposeAllTimes).toEqual(1);
    expect(dc.disposed).toBeTruthy();
  });

  test('DisposableImpl', async () => {
    const di = new DisposableImpl();
    const disposedRet: number[] = [];
    let isDisposed = false;
    di.onDispose(() => {
      isDisposed = true;
    });
    di.toDispose.pushAll([
      {
        dispose() {
          disposedRet.push(1);
        },
      },
    ]);
    di.dispose();
    expect(di.disposed).toBeTruthy();
    expect(disposedRet).toEqual([1]);
    expect(isDisposed).toBeTruthy();
  });
});
