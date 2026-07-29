import type { ApiClient } from '#infrastructure/api/client'
import { createAssigneeSelectDeps } from '~/components/assignee-select/deps-impl'
import { createBoardSelectDeps } from '~/components/board-select/deps-impl'
import { createSpaceSelectDeps } from '~/components/space-select/deps-impl'
import { createStatusSelectDeps } from '~/components/status-select/deps-impl'

import { createIssueCommentsDeps } from '../components/issue-comments/deps-impl'
import type { IssuePageDeps } from '../IssuePage.deps'
import { createDeleteIssue } from './deleteIssue'
import { createSaveIssue } from './saveIssue'
import { createViewIssue } from './viewIssue'

export const createIssuePageDeps = (client: ApiClient): IssuePageDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),
  comments: createIssueCommentsDeps(client),
  deleteIssue: createDeleteIssue(client),
  saveIssue: createSaveIssue(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
  view: createViewIssue(client),
})
