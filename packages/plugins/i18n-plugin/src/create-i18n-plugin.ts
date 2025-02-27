import { I18n, type I18nLanguage } from '@flowgram.ai/i18n';
import { definePluginCreator } from '@flowgram.ai/core';

export interface I18nPluginOptions {
  localLanguage?: string;
  languages?: I18nLanguage[];
  onLanguageChange?: (languageId: string) => void;
}
/**
 * I18n Plugin
 */
export const createI18nPlugin = definePluginCreator<I18nPluginOptions>({
  onInit: (ctx, _opts) => {
    if (_opts.onLanguageChange) {
      ctx.playground.toDispose.push(I18n.onLanguageChange(_opts.onLanguageChange));
    }
    if (_opts.languages) {
      _opts.languages.forEach((language) => I18n.addLanguage(language));
    }
    if (_opts.localLanguage) {
      I18n.setLocalLanguage(_opts.localLanguage);
    }
  },
});
