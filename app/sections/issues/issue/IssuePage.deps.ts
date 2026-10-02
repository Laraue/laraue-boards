import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { IssueAttachmentViewModel } from '~/components/issue-attachments/IssueAttachments.types'
import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type { IssueCommentsDeps } from './components/IssueComments/IssueComments.deps'
import type { IssueDescriptionDeps } from './components/IssueDescription/IssueDescription.deps'
import type { IssueHistoryDeps } from './components/IssueHistory/IssueHistory.deps'

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
  title: string
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
  title: string
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
  title: string
  updatedAt: string
}

export type IssuePageDeps = {
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  comments: IssueCommentsDeps
  deleteIssue: (input: { issueKey: string }) => Promise<void>
  description: IssueDescriptionDeps
  history: IssueHistoryDeps
  // Resolves `complete: false` when the issue was saved but could not be moved to the new status.
  saveIssue: (
    input: IssuePageInput & {
      issueKey: string
      previousBoardId: string
      previousSpaceKey: string
      previousStatusId: string
    },
  ) => Promise<IssuePageSavedIssue>
  spaceSelect: SpaceSelectDeps
  statusSelect: StatusSelectDeps
  view: (input: { issueKey: string; signal?: AbortSignal }) => Promise<IssuePageViewModel>
}
