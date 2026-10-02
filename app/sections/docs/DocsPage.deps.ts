import type { Locale } from '~/composables/useI18n'

import type { DocNode, DocPage } from './content/DocsContent.types'

export type DocsPageDeps = {
  getPage: (locale: Locale, path: string[]) => Promise<DocPage>
  getTree: (locale: Locale) => Promise<DocNode>
}
