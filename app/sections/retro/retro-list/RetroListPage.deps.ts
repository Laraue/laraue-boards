import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { RetroListPageData } from './RetroListPage.types'

export type RetroListPageDeps = {
  removeRetro: (input: { retroId: string }) => Promise<ActionResult<true>>
  startRetro: (input: {
    basedOnRetroId: null | string
    name: string
  }) => Promise<ActionResult<{ retroId: string }>>
  view: (input: { page: number; signal?: AbortSignal }) => Promise<QueryResult<RetroListPageData>>
}
