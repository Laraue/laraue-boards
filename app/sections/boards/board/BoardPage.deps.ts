import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'
import type { IssuePageDeps } from '~/sections/issues/issue/IssuePage.deps'

import type {
  IssueFilter,
  LoadMoreBoardIssuesResult,
  SearchBoardIssuesResult,
  BoardPageViewModel,
} from './BoardPage.types'

export type BoardPageDeps = {
  issueDialog: IssuePageDeps
  loadMoreBoardIssues: (input: {
    filters: IssueFilter[]
    offset: number
    search: string
    statusId: string
    take: number
  }) => Promise<QueryResult<LoadMoreBoardIssuesResult>>
  moveBoardIssue: (input: { issueKey: string; statusId: string }) => Promise<ActionResult<true>>
  moveIssueToBacklog: (input: {
    boardId: string
    issueKey: string
    spaceKey: string
  }) => Promise<ActionResult<true>>
  searchBoardIssues: (input: {
    boardId: string
    filters: IssueFilter[]
    search: string
    take: number
  }) => Promise<QueryResult<SearchBoardIssuesResult>>
  view: (input: {
    attributeQuery: Record<string, string[]>
    boardId: string
    search: string
    signal?: AbortSignal
  }) => Promise<QueryResult<BoardPageViewModel>>
}
