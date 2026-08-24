import type { QueryResult } from '#infrastructure/api/apiResult'
import type { HistoryPageViewModel } from '~/components/history-timeline/HistoryTimeline.types'

import type { OrganizationHistoryPageData } from './OrganizationHistoryPage.types'

export type OrganizationHistoryPageDeps = {
  loadInitial: (input: {
    dateFrom?: string
    dateTo?: string
    ownerId?: string
    signal?: AbortSignal
  }) => Promise<QueryResult<OrganizationHistoryPageData>>
  loadPage: (input: {
    dateFrom?: string
    dateTo?: string
    ownerId?: string
    page: number
    signal?: AbortSignal
  }) => Promise<QueryResult<HistoryPageViewModel>>
}
