import type { HistoryPageViewModel } from '~/components/history-timeline/HistoryTimeline.types'

export type OrganizationHistoryPageData = {
  history: HistoryPageViewModel
  users: Array<{ label: string; value: string }>
}
