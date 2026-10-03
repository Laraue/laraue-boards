import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateBacklogIssuePageData = {
  attributes: IssueAttributeField[]
  boardId: string
  boardName: string
  spaceName: string
}

export type CreateBacklogIssuePageDeps = {
  form: CreateIssueFormDeps
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<CreateBacklogIssuePageData>
}
