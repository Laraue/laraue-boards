import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { ApiKeysPageData, CreatedApiKey } from './ApiKeysPage.types'

export type ApiKeysPageDeps = {
  create: (input: { name: string }) => Promise<ActionResult<CreatedApiKey>>
  revoke: (input: { id: string }) => Promise<ActionResult<true>>
  view: (input: { page: number; signal?: AbortSignal }) => Promise<QueryResult<ApiKeysPageData>>
}
