import type { BoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps'
import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { AssigneeSelectDeps } from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.deps'
import type { IssueAttributeValueInput } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import type { IssueDescriptionDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueDescription/IssueDescription.deps'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

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
