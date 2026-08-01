import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'
import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { IssueCommentsDeps } from './components/IssueComments/IssueComments.deps'
import type { IssueHistoryDeps } from './components/IssueHistory/IssueHistory.deps'
import type { IssuePageInput, IssuePageSavedIssue, IssuePageViewModel } from './IssuePage.types'

export type DeleteIssue = (input: { issueKey: string }) => Promise<ActionResult<true>>

export type SaveIssue = (
  input: IssuePageInput & {
    issueKey: string
    previousBoardId: string
    previousStatusId: string
  },
) => Promise<ActionResult<IssuePageSavedIssue>>

export type ViewIssue = (input: {
  issueKey: string
  signal?: AbortSignal
}) => Promise<QueryResult<IssuePageViewModel>>

export type IssuePageDeps = {
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  comments: IssueCommentsDeps
  deleteIssue: DeleteIssue
  history: IssueHistoryDeps
  saveIssue: SaveIssue
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
  view: ViewIssue
}
