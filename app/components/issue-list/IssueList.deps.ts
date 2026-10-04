import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

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
