import type { Locale } from '~/composables/useI18n'

// The web app lives on the same host; /organizations sends signed-out users to /login.
export const appUrl = '/organizations'
export const botUrl = 'https://t.me/msgboard_bot'
export const githubUrl = 'https://github.com/Laraue/Laraue.Apps.Boards'

// Documentation and the blog stay on laraue.com until they move (BRD-241).
export const laraueUrl = (locale: Locale, path: string): string =>
  `https://laraue.com${locale === 'ru' ? '/ru' : ''}${path}`
