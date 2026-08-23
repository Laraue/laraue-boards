import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateIssueFormInput = {
  assigneeId: string
  attributeValues: IssueAttributeValueInput[]
  content: string
  files: File[]
  statusId: string
}

export type CreateIssueFormBoard = {
  id: string
  name: string
  spaceKey: string
}

export type CreateIssueFormProps = {
  attributes: IssueAttributeField[]
  board?: CreateIssueFormBoard
  initialStatusId?: string
  onCreated: (issueKey: string) => Promise<void> | void
}
