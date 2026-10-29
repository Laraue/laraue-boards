import type { Locale } from '../i18n/translator'

export const telegramBotUrl = 'https://t.me/msgboard_bot'
export const githubRepositoryUrl = 'https://github.com/Laraue/Laraue.Apps.Boards'

// The link preview of the public pages (1200×630), with the text in each language.
export const previewImageUrl: Record<Locale, string> = {
  en: 'https://laraue.com/static/images/boards-og.png',
  ru: 'https://laraue.com/static/images/boards-og-ru.png',
}

// A page of laraue.com, the company's separate website. It is not part of this Nuxt app, so
// `useLocalePath` cannot build it; laraue.com uses the same convention: English at the root,
// Russian under /ru.
export const laraueWebsiteUrl = (locale: Locale, path: string): string =>
  `https://laraue.com${locale === 'ru' ? '/ru' : ''}${path}`
