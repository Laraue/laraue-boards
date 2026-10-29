import type { components } from '#infrastructure/api/generated'
import type { AssigneeSelectDeps } from '~/components/assignee-select/AssigneeSelect.deps'
import type { BoardSelectDeps } from '~/components/board-select/BoardSelect.deps'
import type { IssueAttachmentViewModel } from '~/components/issue-attachments/IssueAttachments.types'
import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { SpaceSelectDeps } from '~/components/space-select/SpaceSelect.deps'
import type { StatusSelectDeps } from '~/components/status-select/StatusSelect.deps'

import type {
  AgentHandOffViewModel,
  IssueAgentRunDeps,
  IssueAgentRunViewModel,
} from './components/IssueAgentRun/IssueAgentRun.deps'
import type { IssueCommentsDeps } from './components/IssueComments/IssueComments.deps'
import type { IssueDescriptionDeps } from './components/IssueDescription/IssueDescription.deps'
import type { IssueHistoryDeps } from './components/IssueHistory/IssueHistory.deps'
import type { IssueLinksDeps } from './components/IssueLinks/IssueLinks.deps'
import type { IssueLinkViewModel } from './components/IssueLinks/IssueLinks.types'

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

// The Telegram message an issue was created from.
export type IssueSourceViewModel = {
  // The group's title; null for the private chat with the bot or when unknown.
  chatTitle: null | string
  isPrivateChat: boolean
  // A t.me link to the message; null where Telegram has none.
  messageUrl: null | string
  sender: null | { color: string; initial: string; name: string }
  sentAt: null | string
}

export type IssuePageViewModel = {
  // Whether the user can hand the issue to the agent now, and if not, why - decided by the backend.
  agentHandOff: AgentHandOffViewModel
  // The latest agent run; null when the issue was never handed to the agent.
  agentRun: IssueAgentRunViewModel | null
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  assigneeIsCurrentUser: boolean
  attachments: IssueAttachmentViewModel[]
  attributes: IssuePageAttributeViewModel[]
  boardColor: string
  boardId: string
  // The backlog has its own page, not a board's.
  boardIsBacklog: boolean
  boardLabel: string
  canEdit: boolean
  content: string
  createdAt: string
  issueKey: string
  // Links to the issues the user can see.
  links: IssueLinkViewModel[]
  owner: string
  ownerColor: string
  ownerInitial: string
  // Null when the issue wasn't created from Telegram.
  source: IssueSourceViewModel | null
  spaceColor: string
  spaceId: string
  spaceLabel: string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId: string
  statusLabel: string
  title: string
  updatedAt: string
}

export type IssuePageDeps = {
  agentRun: IssueAgentRunDeps
  assigneeSelect: AssigneeSelectDeps
  boardSelect: BoardSelectDeps
  comments: IssueCommentsDeps
  deleteIssue: (input: { issueKey: string }) => Promise<void>
  description: IssueDescriptionDeps
  history: IssueHistoryDeps
  links: IssueLinksDeps
  // Resolves `complete: false` when the issue was saved but could not be moved to the new status.
  saveIssue: (
    input: IssuePageInput & {
      // The issue is handed to the agent: only the status move is saved, its fields are locked.
      fieldsLocked?: boolean
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
