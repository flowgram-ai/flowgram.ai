import { Emitter } from '@flowgram.ai/utils';

interface I18nLanguage {
  languageId: string;
  languageName?: string;
  localizedLanguageName?: string;
  contents: Record<string, string>;
}

import zhCNLanguageDefault from './i18n/zh-CN';
import enUSLanguageDefault from './i18n/en-US';

class I18nImpl {
  private _languages = new Map<string, I18nLanguage>();

  private _localLanguage = 'en-US';

  private _onLanguageChangeEmitter = new Emitter<string>();

  readonly onLanguageChange = this._onLanguageChangeEmitter.event;

  constructor(languages: I18nLanguage[]) {
    languages.forEach((language) => this.addLanguage(language));
  }

  /**
   * TODO support replace
   * @param key
   * @param options
   */
  t(key: string, options?: { disableReturnKey?: boolean }): string {
    const contents: Record<string, string> =
      this._languages.get(this._localLanguage)?.contents || {};
    if (contents[key]) {
      return contents[key];
    }
    if (options?.disableReturnKey) return '';
    return key;
  }

  getLocalLanguage() {
    return this._localLanguage;
  }

  setLocalLanguage(langId: string) {
    if (langId === this._localLanguage) return;
    this._localLanguage = langId;
    this._onLanguageChangeEmitter.fire(langId);
  }

  getLangauges() {
    return this._languages;
  }

  addLanguage(newLanguage: I18nLanguage): void {
    let oldLanguage = this._languages.get(newLanguage.languageId);
    if (oldLanguage) {
      this._languages.set(newLanguage.languageId, {
        ...oldLanguage,
        ...newLanguage,
        contents: {
          ...oldLanguage.contents,
          ...newLanguage.contents,
        },
      });
    } else {
      this._languages.set(newLanguage.languageId, newLanguage);
    }
  }
}

const I18n = new I18nImpl([enUSLanguageDefault, zhCNLanguageDefault]);

export { I18n, I18nLanguage };
