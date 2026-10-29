import { ApiError } from '#infrastructure/api/request'

import type { DocsPageDeps } from './DocsPage.deps'

export type DocsFetcher = (
  url: string,
  options?: { query: Record<string, string> },
) => Promise<unknown>

const load = async <Data>(
  fetcher: DocsFetcher,
  url: string,
  query?: Record<string, string>,
): Promise<Data> => {
  try {
    return (await fetcher(url, query ? { query } : undefined)) as Data
  } catch (cause) {
    throw new ApiError((cause as { statusCode?: number }).statusCode ?? 0)
  }
}

// The docs are read from this app's own `/docs-content` routes (see `server/routes/docs-content`),
// on the server while rendering and in the browser when moving between pages.
export const createDocsPageDeps = (fetcher: DocsFetcher): DocsPageDeps => ({
  getPage: (locale, path) =>
    load(fetcher, `/docs-content/${locale}/page`, { path: path.join('/') }),
  getTree: (locale) => load(fetcher, `/docs-content/${locale}`),
})
