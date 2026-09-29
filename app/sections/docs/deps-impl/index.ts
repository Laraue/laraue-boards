import type { DocsPageDeps } from '../DocsPage.deps'
import type { DocsFetcher } from './docsRequests'
import { createGetDocsPage, createGetDocsTree } from './docsRequests'

export const createDocsPageDeps = (fetcher: DocsFetcher): DocsPageDeps => ({
  getPage: createGetDocsPage(fetcher),
  getTree: createGetDocsTree(fetcher),
})
