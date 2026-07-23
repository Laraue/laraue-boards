import type { QueryResult } from '#infrastructure/api/apiResult'
import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'

import type { CreateBacklogIssuePageData } from './CreateBacklogIssuePage.types'

export type ViewBacklogIssue = (input: {
  signal?: AbortSignal
  spaceKey: string
}) => Promise<QueryResult<CreateBacklogIssuePageData>>

export type CreateBacklogIssuePageDeps = {
  form: CreateIssueFormDeps
  view: ViewBacklogIssue
}
