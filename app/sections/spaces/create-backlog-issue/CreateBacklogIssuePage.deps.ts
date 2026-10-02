import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateBacklogIssuePageData = {
  attributes: IssueAttributeField[]
  boardId: string
  boardName: string
}

export type CreateBacklogIssuePageDeps = {
  form: CreateIssueFormDeps
  // Resolves with the page data or rejects with an `ApiError`.
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<CreateBacklogIssuePageData>
}
