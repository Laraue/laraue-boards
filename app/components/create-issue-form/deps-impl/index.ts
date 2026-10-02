import type { ApiClient } from '#infrastructure/api/client'
import { createAssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps.impl'
import { createBoardSelectDeps } from '~/components/board-select/BoardSelect.deps.impl'
import { createSpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps.impl'
import { createStatusSelectDeps } from '~/components/status-select/StatusSelect.deps.impl'
import { createIssueDescriptionDeps } from '~/sections/issues/issue/components/IssueDescription/deps-impl'

import type { CreateIssueFormDeps } from '../CreateIssueForm.deps'
import { createCreateIssue } from './createIssue'

export const createCreateIssueFormDeps = (client: ApiClient): CreateIssueFormDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),
  create: createCreateIssue(client),
  description: createIssueDescriptionDeps(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
