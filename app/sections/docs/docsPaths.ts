import type { Locale } from '~/composables/useI18n'

// The address of a docs page: docsPath('ru', ['concepts', 'issues']) -> /ru/documentation/concepts/issues
export const docsPath = (locale: Locale, path: string[] = []): string =>
  ['', locale, 'documentation', ...path].join('/')
