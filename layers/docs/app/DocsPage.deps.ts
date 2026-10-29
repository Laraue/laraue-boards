import type { Locale } from '#layers/core/app/i18n/useI18n'

import type { DocNode, DocPage } from '../shared/DocsContent.types'

export type DocsPageDeps = {
  getPage: (locale: Locale, path: string[]) => Promise<DocPage>
  getTree: (locale: Locale) => Promise<DocNode>
}
