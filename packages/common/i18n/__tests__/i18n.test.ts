import { describe, it, expect } from 'vitest';

import { I18n } from '../src';

describe('i18n', () => {
  it('default', () => {
    expect(I18n.getLocalLanguage()).toBe('en-US');
    expect(I18n.getLangauges().size).toBe(2);
  });
  it('setLocalLanguage', () => {
    let changeTimes = 0;
    let dispose = I18n.onLanguageChange((langId) => {
      changeTimes++;
    });
    I18n.setLocalLanguage('en-US');
    expect(changeTimes).toEqual(0);
    I18n.setLocalLanguage('zh-CN');
    expect(changeTimes).toEqual(1);
    dispose.dispose();
    I18n.setLocalLanguage('en-US');
    expect(changeTimes).toEqual(1);
  });
  it('translation', () => {
    expect(I18n.t('Yes')).toEqual('Yes');
    I18n.setLocalLanguage('zh-CN');
    expect(I18n.t('Yes')).toEqual('是');
    expect(I18n.t('Unknown')).toEqual('Unknown');
    expect(I18n.t('Unknown', { disableReturnKey: true })).toEqual('');
    I18n.addLanguage({
      languageId: 'zh-CN',
      contents: {
        Unknown: '未知',
      },
    });
    expect(I18n.t('Unknown')).toEqual('未知');
    expect(I18n.t('Unknown', { disableReturnKey: true })).toEqual('未知');
  });
});
