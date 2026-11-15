import type { HistoryPageViewModel } from '#layers/workspace/app/shared/components/HistoryTimeline/HistoryTimeline.types'

export type IssueHistoryDeps = {
  load: (input: { issueKey: string; page: number }) => Promise<HistoryPageViewModel>
}
