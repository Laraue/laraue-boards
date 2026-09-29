import type { QueryResult } from '#infrastructure/api/apiResult'
import type { Locale } from '~/composables/useI18n'

import type { DocNode, DocPage } from './content/DocsContent.types'

export type GetDocsTree = (locale: Locale) => Promise<QueryResult<DocNode>>

export type GetDocsPage = (locale: Locale, path: string[]) => Promise<QueryResult<DocPage>>

export type DocsPageDeps = {
  getPage: GetDocsPage
  getTree: GetDocsTree
}
