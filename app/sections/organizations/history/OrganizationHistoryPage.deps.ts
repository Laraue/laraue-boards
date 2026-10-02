import type { HistoryPageViewModel } from '~/components/history-timeline/HistoryTimeline.types'

export type OrganizationHistoryPageData = {
  history: HistoryPageViewModel
  users: Array<{ label: string; value: string }>
}

type HistoryFilters = { dateFrom?: string; dateTo?: string; ownerId?: string }

export type OrganizationHistoryPageDeps = {
  loadInitial: (
    input: HistoryFilters & { signal?: AbortSignal },
  ) => Promise<OrganizationHistoryPageData>
  loadPage: (input: HistoryFilters & { page: number }) => Promise<HistoryPageViewModel>
}
