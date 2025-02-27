import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowNodeEntity } from '@flowgram.ai/document';

import { DataEvent, FormMeta } from '../src/types';
import { defineFormPluginCreator } from '../src/form-plugin';
import { FormModelV2 } from '../src/form-model-v2';

describe('FormModelV2', () => {
  const node = {
    getService: vi.fn().mockReturnValue({}),
    getData: vi.fn().mockReturnValue({ fireChange: vi.fn() }),
  } as unknown as FlowNodeEntity;

  let formModelV2 = new FormModelV2(node);

  beforeEach(() => {
    formModelV2.dispose();
    formModelV2 = new FormModelV2(node);
  });

  describe('v1 apis', () => {
    it('getFormItemValueByPath', () => {
      const formMeta = {
        render: vi.fn(),
      };
      formModelV2.init(formMeta, {
        a: 1,
        b: 2,
      });

      expect(formModelV2.getFormItemValueByPath('/a')).toBe(1);
      expect(formModelV2.getFormItemValueByPath('/b')).toBe(2);
      expect(formModelV2.getFormItemValueByPath('/')).toEqual({ a: 1, b: 2 });
    });
    it('getFormItemByPath when path is /', () => {
      const formMeta = {
        render: vi.fn(),
      };
      formModelV2.init(formMeta, {
        a: 1,
        b: 2,
      });

      const formItem = formModelV2.getFormItemByPath('/');
      expect(formItem.value).toEqual({
        a: 1,
        b: 2,
      });

      formItem.value = { a: 3, b: 4 };

      expect(formItem.value).toEqual({
        a: 3,
        b: 4,
      });
    });
  });

  describe('effects', () => {
    it('should trigger init effects when initialValues exists', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger init effects when formatOnInit return value', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        formatOnInit: () => ({ a: { b: 1 } }),
        effect: {
          'a.b': [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger value change effects', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      formModelV2.setValueIn('a', 2);
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger onValueInitOrChange effects when form defaultValue init', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger onValueInitOrChange effects when field defaultValue init', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      formModelV2.nativeFormModel?.setInitValueIn('a', 2);
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger child onValueInit effects when field defaultValue init', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          'a.b.c': [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      formModelV2.nativeFormModel?.setInitValueIn('a', { b: { c: 1 } });
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should not trigger child onValueInit effects when field defaultValue init but child path has no value', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          'a.b.c': [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      formModelV2.nativeFormModel?.setInitValueIn('a', 2);
      expect(mockEffect).not.toHaveBeenCalled();
    });
    it('should trigger onValueInitOrChange effects when value change', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      formModelV2.setValueIn('a', 2);
      expect(mockEffect).toHaveBeenCalledOnce();
    });
    it('should trigger single item init effect when array append', () => {
      const mockEffect = vi.fn();
      const formMeta = {
        render: vi.fn(),
        effect: {
          ['arr.*']: [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta);
      const arrModel = formModelV2.nativeFormModel?.createFieldArray('arr');
      arrModel?.append(1);
      arrModel?.append(2);
      expect(mockEffect).toHaveBeenCalledTimes(2);
    });
    it('should trigger value change effects return when value change', () => {
      const mockEffectReturn = vi.fn();
      const mockEffect = vi.fn(() => mockEffectReturn);

      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      formModelV2.setValueIn('a', 2);
      formModelV2.setValueIn('a', 3);
      expect(mockEffect).toHaveBeenCalledTimes(2);
      expect(mockEffectReturn).toHaveBeenCalledOnce();
    });
    it('should trigger onValueInitOrChange effects return when value init', () => {
      const mockEffectReturn = vi.fn();
      const mockEffect = vi.fn(() => mockEffectReturn);

      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      formModelV2.setValueIn('a', 2);
      expect(mockEffectReturn).toHaveBeenCalledOnce();
    });
    it('should trigger onValueInitOrChange effects return when value init and change', () => {
      const mockEffectReturn = vi.fn();
      const mockEffect = vi.fn(() => mockEffectReturn);

      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1 });
      formModelV2.setValueIn('a', 2);
      formModelV2.setValueIn('a', 3);
      // 第一次setValue，触发 init 时记录的return， 第二次setValue 触发 第一次setValue时记录的return， 共2次
      expect(mockEffectReturn).toHaveBeenCalledTimes(2);
    });
    it('should update effect return function each time init or change the value', () => {
      const mockEffectReturn = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(2);
      const mockEffect = vi.fn(() => mockEffectReturn);

      const formMeta = {
        render: vi.fn(),
        effect: {
          ['arr.*.var']: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { arr: [] });
      const form = formModelV2.nativeFormModel!;
      const arrayField = form.createFieldArray('arr');
      arrayField!.append({ var: 'x' });
      form.setValueIn('arr.0.var', 'y');

      formModelV2.dispose();

      expect(mockEffectReturn).toHaveNthReturnedWith(1, 1);
      expect(mockEffectReturn).toHaveNthReturnedWith(2, 2);
    });
    it('should trigger all effects return when formModel dispose', () => {
      const mockEffectReturn1 = vi.fn();
      const mockEffect1 = vi.fn(() => mockEffectReturn1);
      const mockEffectReturn2 = vi.fn();
      const mockEffect2 = vi.fn(() => mockEffectReturn2);

      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffect1,
            },
          ],
          b: [
            {
              event: DataEvent.onValueInit,
              effect: mockEffect2,
            },
          ],
        },
      };
      formModelV2.init(formMeta, { a: 1, b: 2 });

      formModelV2.dispose();

      expect(mockEffectReturn1).toHaveBeenCalledTimes(1);
      expect(mockEffectReturn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('plugins', () => {
    beforeEach(() => {
      formModelV2.dispose();
      formModelV2 = new FormModelV2(node);
    });
    it('should call onInit when formModel init', () => {
      const mockInit = vi.fn();
      const plugin = defineFormPluginCreator('test', {
        onInit: mockInit,
      })({ opt1: 1 });
      const formMeta = {
        render: vi.fn(),
        plugins: [plugin],
      } as unknown as FormMeta;
      formModelV2.init(formMeta);

      expect(mockInit).toHaveBeenCalledOnce();
      expect(mockInit).toHaveBeenCalledWith(
        { formModel: formModelV2, ...formModelV2.nodeContext },
        { opt1: 1 }
      );
    });
    it('should call onDispose when formModel dispose', () => {
      const mockDispose = vi.fn();
      const plugin = defineFormPluginCreator('test', {
        onDispose: mockDispose,
      })({ opt1: 1 });
      const formMeta = {
        render: vi.fn(),
        plugins: [plugin],
      } as unknown as FormMeta;
      formModelV2.init(formMeta);
      formModelV2.dispose();

      expect(mockDispose).toHaveBeenCalledOnce();
      expect(mockDispose).toHaveBeenCalledWith(
        { formModel: formModelV2, ...formModelV2.nodeContext },
        { opt1: 1 }
      );
    });
    it('should call effects when corresponding events trigger', () => {
      const mockEffectPlugin = vi.fn();
      const mockEffectOrigin = vi.fn();

      const plugin = defineFormPluginCreator('test', {
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffectPlugin,
            },
          ],
        },
      })({ opt1: 1 });

      const formMeta = {
        render: vi.fn(),
        effect: {
          a: [
            {
              event: DataEvent.onValueInitOrChange,
              effect: mockEffectOrigin,
            },
          ],
        },
        plugins: [plugin],
      } as unknown as FormMeta;

      formModelV2.init(formMeta, { a: 0 });

      expect(mockEffectPlugin).toHaveBeenCalledOnce();
      expect(mockEffectOrigin).toHaveBeenCalledOnce();
    });
    it('should call effects when corresponding events trigger: array case', () => {
      const mockEffectPluginArrStar = vi.fn();
      const mockEffectOriginArrStar = vi.fn();
      const mockEffectPluginOther = vi.fn();

      const plugin = defineFormPluginCreator('test', {
        effect: {
          'arr.*': [
            {
              event: DataEvent.onValueChange,
              effect: mockEffectPluginArrStar,
            },
          ],
          other: [
            {
              event: DataEvent.onValueChange,
              effect: mockEffectPluginOther,
            },
          ],
        },
      })({ opt1: 1 });

      const formMeta = {
        render: vi.fn(),
        effect: {
          'arr.*': [
            {
              event: DataEvent.onValueChange,
              effect: mockEffectOriginArrStar,
            },
          ],
        },
        plugins: [plugin],
      } as unknown as FormMeta;

      formModelV2.init(formMeta, { arr: [0], other: 1 });
      formModelV2.setValueIn('arr.0', 2);
      formModelV2.setValueIn('other', 2);

      expect(mockEffectOriginArrStar).toHaveBeenCalledOnce();
      expect(mockEffectPluginArrStar).toHaveBeenCalledOnce();
      expect(mockEffectPluginOther).toHaveBeenCalledOnce();
    });
  });
  describe('onFormValueChangeIn', () => {
    beforeEach(() => {
      formModelV2.dispose();
      formModelV2 = new FormModelV2(node);
    });

    it('should trigger callback when value change', () => {
      const mockCallback = vi.fn();
      const formMeta = {
        render: vi.fn(),
      } as unknown as FormMeta;
      formModelV2.init(formMeta, { a: 1 });
      formModelV2.onFormValueChangeIn('a', mockCallback);
      formModelV2.setValueIn('a', 2);

      expect(mockCallback).toHaveBeenCalledOnce();
    });
    it('should throw error when formModel is not initialized', () => {
      expect(() => formModelV2.onFormValueChangeIn('a', vi.fn())).toThrowError();
    });
  });
});
