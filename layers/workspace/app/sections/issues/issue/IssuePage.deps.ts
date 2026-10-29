import type { components } from '#infrastructure/api/generated'
import type { BoardSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.deps'
import type { StatusSelectDeps } from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.deps'
import type { AssigneeSelectDeps } from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.deps'
import type { IssueAttachmentViewModel } from '#layers/workspace/app/sections/issues/shared/components/IssueAttachments/IssueAttachments.types'
import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import type { IssueDescriptionDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueDescription/IssueDescription.deps'
import type { IssueSource } from '#layers/workspace/app/sections/issues/shared/components/IssueSourceIcon/IssueSourceIcon.types'
import type { IssueLinkViewModel } from '#layers/workspace/app/sections/issues/shared/model/IssueLinks.types'
import type { SpaceSelectDeps } from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.deps'

import type {
  AgentHandOffViewModel,
  IssueAgentRunDeps,
  IssueAgentRunViewModel,
} from './components/IssueAgentRun/IssueAgentRun.deps'
import type { IssueCommentsDeps } from './components/IssueComments/IssueComments.deps'
import type { IssueHistoryDeps } from './components/IssueHistory/IssueHistory.deps'
import type { IssueLinksDeps } from './components/IssueLinks/IssueLinks.deps'

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
  // How the issue was created; null when the API sends none.
  createdVia: IssueSource | null
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
