import zhCN from './locales/zh-CN'
import en from './locales/en'

export type LocaleKey = keyof typeof zhCN
export type Locale = 'zh-CN' | 'en'

const locales: Record<Locale, Record<LocaleKey, string>> = {
  'zh-CN': zhCN,
  'en': en,
}

export function createTranslator(locale: Locale) {
  const messages = locales[locale] || locales['zh-CN']

  return function t(key: LocaleKey): string {
    return messages[key] || key
  }
}

export { zhCN, en }
