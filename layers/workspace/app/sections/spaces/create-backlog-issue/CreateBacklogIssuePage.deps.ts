import type { CreateIssueFormDeps } from '#layers/workspace/app/sections/issues/shared/components/CreateIssueForm/CreateIssueForm.deps'
import type { IssueAttributeField } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'

export type CreateBacklogIssuePageData = {
  attributes: IssueAttributeField[]
  boardId: string
  boardName: string
  spaceColor: string
  spaceName: string
}

export type CreateBacklogIssuePageDeps = {
  form: CreateIssueFormDeps
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<CreateBacklogIssuePageData>
}
