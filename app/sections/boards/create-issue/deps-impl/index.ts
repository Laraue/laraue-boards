import type { ApiClient } from '#infrastructure/api/client'
import { createCreateIssueFormDeps } from '~/components/create-issue-form/deps-impl'

import type { CreateBoardIssuePageDeps } from '../CreateBoardIssuePage.deps'
import { createViewBoardIssue } from './viewBoardIssue'

export const createCreateBoardIssuePageDeps = (client: ApiClient): CreateBoardIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: createViewBoardIssue(client),
})
