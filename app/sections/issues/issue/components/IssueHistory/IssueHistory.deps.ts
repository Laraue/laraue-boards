import type { QueryResult } from '#infrastructure/api/apiResult'
import type { HistoryPageViewModel } from '~/components/history-timeline/HistoryTimeline.types'

export type LoadIssueHistory = (input: {
  issueKey: string
  page: number
}) => Promise<QueryResult<HistoryPageViewModel>>

export type IssueHistoryDeps = {
  load: LoadIssueHistory
}
