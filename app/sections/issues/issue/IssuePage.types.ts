import type { IssueAttachmentViewModel } from '~/components/issue-attachments/IssueAttachments.types'
import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '~/components/issue-attribute-fields/IssueAttributeFields.types'

import type { IssueCommentViewModel } from './components/IssueComments/IssueComments.types'

type IssuePageAttributeViewModel = IssueAttributeField & {
  value: string
}

export type IssuePageSavedIssue = {
  boardId: string
  complete: boolean
  content: string
  issueKey: string
  previousBoardId: string
  previousIssueKey: string
  previousStatusId: string
  spaceKey: string
  statusId: string
}

export type IssuePageInput = {
  assigneeId: string
  attributeValues: IssueAttributeValueInput[]
  boardId: string
  content: string
  files: File[]
  removeAttachmentIds: string[]
  spaceKey: string
  statusId: string
}

export type IssuePageViewModel = {
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  assigneeIsCurrentUser: boolean
  attachments: IssueAttachmentViewModel[]
  attributes: IssuePageAttributeViewModel[]
  boardId: string
  boardLabel: string
  canEdit: boolean
  comments: IssueCommentViewModel[]
  content: string
  createdAt: string
  issueKey: string
  owner: string
  ownerColor: string
  ownerInitial: string
  spaceId: string
  spaceLabel: string
  statusId: string
  statusLabel: string
  updatedAt: string
}
