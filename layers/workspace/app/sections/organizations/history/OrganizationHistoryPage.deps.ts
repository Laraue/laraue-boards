import type { HistoryPageViewModel } from '#layers/workspace/app/shared/components/HistoryTimeline/HistoryTimeline.types'

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
