import type { ActionResult } from '#infrastructure/api/apiResult'
import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { CreateIssueFormInput } from './CreateIssueForm.types'

export type CreateIssue = (
  input: CreateIssueFormInput,
) => Promise<ActionResult<{ issueKey: string }>>

export type CreateIssueFormDeps = {
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  create: CreateIssue
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
