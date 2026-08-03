import type { QueryResult } from '#infrastructure/api/apiResult'

import type { IssueHistoryPageViewModel } from './IssueHistory.types'

export type LoadIssueHistory = (input: {
  issueKey: string
  page: number
}) => Promise<QueryResult<IssueHistoryPageViewModel>>

export type IssueHistoryDeps = {
  load: LoadIssueHistory
}
