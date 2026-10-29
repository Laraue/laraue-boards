import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { AssigneeSelectDeps } from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.deps'

import type { MoveIssuesDialogDeps } from './components/move-issues-dialog/MoveIssuesDialog.deps'

export type IssueListQuickEditDeps = {
  assigneeSelect: AssigneeSelectDeps
  saveAssignee: (input: { assigneeId: string; issueKey: string }) => Promise<void>
  saveStatus: (input: { issueKey: string; statusId: string }) => Promise<void>
  statusSelect: StatusSelectDeps
}

export type IssueListDeps = {
  deleteIssue?: (input: { issueKey: string }) => Promise<void>
  moveIssuesDialog: MoveIssuesDialogDeps
  quickEdit?: IssueListQuickEditDeps
}
