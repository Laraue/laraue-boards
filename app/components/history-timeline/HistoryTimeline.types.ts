import type { RouteLocationRaw } from 'vue-router'

import type { components } from '#infrastructure/api/generated'
import type { AgentRunState } from '~/components/agent-run-badge/AgentRunBadge.types'
import type { IssueDescriptionDiffLine } from '~/sections/issues/issue/components/IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'
import type { IssueLinkRelation } from '~/sections/issues/issue/components/IssueLinks/IssueLinks.types'

export type HistoryAction = components['schemas']['LogAction']

export type HistoryDescriptionChangeViewModel = {
  // Comment content changes are titled by the comment action; issue content changes are the description.
  commentAction: HistoryAction | null
  diff: IssueDescriptionDiffLine[]
  kind: 'description'
}

export type HistoryAttachmentChangeViewModel = {
  action: 'added' | 'removed'
  fileName: null | string
  imageUrl: null | string
  kind: 'attachment'
}

// An agent run of the issue moved from one state to another; no old state when it was handed off.
export type HistoryAgentRunChangeViewModel = {
  kind: 'agentRun'
  newState: AgentRunState
  oldState: AgentRunState | null
}

// A link to another issue added or removed; `relation` is what it means from this issue's side.
export type HistoryLinkChangeViewModel = {
  action: 'added' | 'removed'
  issueKey: null | string
  kind: 'link'
  relation: IssueLinkRelation
}

export type HistoryEventChangeViewModel = {
  action: HistoryAction
  entityType: components['schemas']['LogEntityType']
  kind: 'event'
}

// null value means "none" and is rendered by the component in the current locale.
type HistoryValueChange<Kind extends string> = {
  kind: Kind
  newColor: null | string
  newValue: null | string
  oldColor: null | string
  oldValue: null | string
}

export type HistoryAssigneeChangeViewModel = HistoryValueChange<'assignee'>

export type HistoryBoardChangeViewModel = HistoryValueChange<'board'>

export type HistoryPropertyChangeViewModel = HistoryValueChange<'property'> & {
  format: 'date' | 'dateTime' | null
  label: string
}

export type HistorySpaceChangeViewModel = HistoryValueChange<'space'>

export type HistoryStatusChangeViewModel = HistoryValueChange<'status'> & {
  newCategory?: components['schemas']['StatusCategory'] | null
  oldCategory?: components['schemas']['StatusCategory'] | null
}

export type HistoryTitleChangeViewModel = HistoryValueChange<'title'>

export type HistoryChangeViewModel =
  | HistoryAgentRunChangeViewModel
  | HistoryAssigneeChangeViewModel
  | HistoryAttachmentChangeViewModel
  | HistoryBoardChangeViewModel
  | HistoryDescriptionChangeViewModel
  | HistoryEventChangeViewModel
  | HistoryLinkChangeViewModel
  | HistoryPropertyChangeViewModel
  | HistorySpaceChangeViewModel
  | HistoryStatusChangeViewModel
  | HistoryTitleChangeViewModel

export type HistoryItemViewModel = {
  changes: HistoryChangeViewModel[]
  createdAt: string
  issueKey?: null | string
  // Shown next to the issue link of an organization-wide history row.
  issueTitle?: null | string
  link?: {
    label: string
    to: RouteLocationRaw
  }
  owner: {
    apiKeyName?: string
    color: string
    initials: string
    name: string
  }
}

export type HistoryPageViewModel = {
  hasNextPage: boolean
  items: HistoryItemViewModel[]
}
