import type { CreateIssueFormDeps } from '~/components/create-issue-form/CreateIssueForm.deps'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateIssuePageData = {
  attributes: IssueAttributeField[]
}

export type CreateIssuePageDeps = {
  form: CreateIssueFormDeps
  view: (input: { signal?: AbortSignal }) => Promise<CreateIssuePageData>
}
