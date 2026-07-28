import type { QueryResult } from '#infrastructure/api/apiResult'
import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'

import type { CreateIssuePageData } from './CreateIssuePage.types'

export type ViewCreateIssue = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<CreateIssuePageData>>

export type CreateIssuePageDeps = {
  form: CreateIssueFormDeps
  view: ViewCreateIssue
}
