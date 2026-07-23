import type { QueryResult } from '#infrastructure/api/apiResult'
import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'

import type { CreateBoardIssuePageData } from './CreateBoardIssuePage.types'

export type ViewBoardIssue = (input: {
  boardId: string
  signal?: AbortSignal
  spaceKey: string
}) => Promise<QueryResult<CreateBoardIssuePageData>>

export type CreateBoardIssuePageDeps = {
  form: CreateIssueFormDeps
  view: ViewBoardIssue
}
