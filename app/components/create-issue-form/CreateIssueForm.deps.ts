import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { IssueAttributeValueInput } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'
import type { IssueDescriptionDeps } from '~/sections/issues/issue/components/IssueDescription/IssueDescription.deps'

export type CreateIssueFormInput = {
  assigneeId: string
  attributeValues: IssueAttributeValueInput[]
  content: string
  files: File[]
  statusId: string
  title: string
}

export type CreateIssueFormDeps = {
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  // Resolves with the key of the new issue.
  create: (input: CreateIssueFormInput) => Promise<string>
  description: IssueDescriptionDeps
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
}
