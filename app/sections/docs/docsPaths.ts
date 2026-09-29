import type { DocsLocale } from './content/DocsContent.types'

// The address of a docs page: docsPath('ru', ['concepts', 'issues']) -> /ru/documentation/concepts/issues
export const docsPath = (locale: DocsLocale, path: string[] = []): string =>
  ['', locale, 'documentation', ...path].join('/')
