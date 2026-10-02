import type { HistoryPageViewModel } from '~/components/history-timeline/HistoryTimeline.types'

export type IssueHistoryDeps = {
  load: (input: { issueKey: string; page: number }) => Promise<HistoryPageViewModel>
}
