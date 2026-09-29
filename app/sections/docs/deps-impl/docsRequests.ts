import type { QueryResult } from '#infrastructure/api/apiResult'

import type { GetDocsPage, GetDocsTree } from '../DocsPage.deps'

export type DocsFetcher = (
  url: string,
  options?: { query: Record<string, string> },
) => Promise<unknown>

const request = async <Data>(
  fetcher: DocsFetcher,
  url: string,
  query?: Record<string, string>,
): Promise<QueryResult<Data>> => {
  try {
    const data = (await fetcher(url, query ? { query } : undefined)) as Data
    return { data, status: 'success' }
  } catch (cause) {
    return { code: (cause as { statusCode?: number }).statusCode ?? 0, status: 'error' }
  }
}

// The docs are read from this app's own `/docs-content` routes (see `server/routes/docs-content`),
// on the server while rendering and in the browser when moving between pages.
export const createGetDocsTree =
  (fetcher: DocsFetcher): GetDocsTree =>
  (locale) =>
    request(fetcher, `/docs-content/${locale}`)

export const createGetDocsPage =
  (fetcher: DocsFetcher): GetDocsPage =>
  (locale, path) =>
    request(fetcher, `/docs-content/${locale}/page`, { path: path.join('/') })
