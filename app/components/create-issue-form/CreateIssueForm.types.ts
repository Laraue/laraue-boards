import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateIssueFormInput = {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  files: File[]
  statusId: string
}

export type CreateIssueFormBoard = {
  id: string
  name: string
  spaceId: string
}

export type CreateIssueFormProps = {
  attributes: IssueAttributeField[]
  board?: CreateIssueFormBoard
  onCreated: (issueKey: string) => Promise<void> | void
}
