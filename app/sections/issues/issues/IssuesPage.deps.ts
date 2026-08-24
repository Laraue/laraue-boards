import type { QueryResult } from '#infrastructure/api/apiResult'
import type { IssueListDeps } from '~/components/issue-list/IssueList.deps'

import type {
  IssueBoardStatus,
  IssuesFilter,
  IssuesPageData,
  SearchIssuesResult,
} from './IssuesPage.types'

export type SearchIssues = (input: {
  epicStatuses: IssueBoardStatus[]
  filters: IssuesFilter[]
  page: number
  search: string
  spaceIds: string[]
}) => Promise<QueryResult<SearchIssuesResult>>

export type ViewIssues = (input: {
  attributeQuery: Record<string, string[]>
  epicStatuses: IssueBoardStatus[]
  page: number
  search: string
  signal?: AbortSignal
  spaceIds: string[]
}) => Promise<QueryResult<IssuesPageData>>

export type IssuesPageDeps = {
  issueList: IssueListDeps
  searchIssues: SearchIssues
  view: ViewIssues
}
