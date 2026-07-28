import type { ApiClient } from '#infrastructure/api/client'
import { createCreateIssueFormDeps } from '~/components/create-issue-form/deps-impl'

import type { CreateBacklogIssuePageDeps } from '../CreateBacklogIssuePage.deps'
import { createViewBacklogIssue } from './viewBacklogIssue'

export const createCreateBacklogIssuePageDeps = (
  client: ApiClient,
): CreateBacklogIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: createViewBacklogIssue(client),
})
