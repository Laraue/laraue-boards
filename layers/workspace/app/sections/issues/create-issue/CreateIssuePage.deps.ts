import type { CreateIssueFormDeps } from '#layers/workspace/app/shared/components/CreateIssueForm/CreateIssueForm.deps'
import type { IssueAttributeField } from '#layers/workspace/app/shared/components/IssueAttributeFields/IssueAttributeFields.types'

export type CreateIssuePageData = {
  attributes: IssueAttributeField[]
}

export type CreateIssuePageDeps = {
  form: CreateIssueFormDeps
  view: (input: { signal?: AbortSignal }) => Promise<CreateIssuePageData>
}
