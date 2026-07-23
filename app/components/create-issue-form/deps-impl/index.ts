import type { ApiClient } from '#infrastructure/api/client'
import { createAssigneeSelectDeps } from '~/components/assignee-select/deps-impl'
import { createBoardSelectDeps } from '~/components/board-select/deps-impl'
import { createSpaceSelectDeps } from '~/components/space-select/deps-impl'
import { createStatusSelectDeps } from '~/components/status-select/deps-impl'

import type { CreateIssueFormDeps } from '../CreateIssueForm.deps'
import { createCreateIssue } from './createIssue'

export const createCreateIssueFormDeps = (client: ApiClient): CreateIssueFormDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),
  create: createCreateIssue(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})
