import type { ApiClient } from '#infrastructure/api/client'
import { createCreateIssueFormDeps } from '~/components/create-issue-form/deps-impl'

import type { CreateIssuePageDeps } from '../CreateIssuePage.deps'
import { createViewCreateIssue } from './viewCreateIssue'

export const createCreateIssuePageDeps = (client: ApiClient): CreateIssuePageDeps => ({
  form: createCreateIssueFormDeps(client),
  view: createViewCreateIssue(client),
})
