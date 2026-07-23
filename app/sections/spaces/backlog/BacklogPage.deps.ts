import type { QueryResult } from '#infrastructure/api/apiResult'
import type { IssueListDeps } from '~/components/issue-list/IssueList.deps'

import type { BacklogFilter, BacklogPageData, SearchBacklogResult } from './BacklogPage.types'

export type SearchBacklog = (input: {
  backlogBoardId: string
  filters: BacklogFilter[]
  page: number
  search: string
}) => Promise<QueryResult<SearchBacklogResult>>

export type ViewBacklog = (input: {
  attributeQuery: Record<string, string[]>
  page: number
  search: string
  signal?: AbortSignal
  spaceKey: string
}) => Promise<QueryResult<BacklogPageData>>

export type BacklogPageDeps = {
  issueList: IssueListDeps
  search: SearchBacklog
  view: ViewBacklog
}
