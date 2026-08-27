import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { RetroListItemViewModel } from './RetroListPage.types'

export type RetroListPageDeps = {
  startRetro: (input: { name: string }) => Promise<ActionResult<{ retroId: string }>>
  view: (input: { signal?: AbortSignal }) => Promise<QueryResult<RetroListItemViewModel[]>>
}
