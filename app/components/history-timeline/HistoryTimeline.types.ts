import type { RouteLocationRaw } from 'vue-router'

import type { components } from '#infrastructure/api/generated'
import type { IssueDescriptionDiffLine } from '~/sections/issues/issue/components/IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

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

export type HistoryStatusChangeViewModel = HistoryValueChange<'status'>

export type HistoryChangeViewModel =
  | HistoryAssigneeChangeViewModel
  | HistoryAttachmentChangeViewModel
  | HistoryBoardChangeViewModel
  | HistoryDescriptionChangeViewModel
  | HistoryEventChangeViewModel
  | HistoryPropertyChangeViewModel
  | HistorySpaceChangeViewModel
  | HistoryStatusChangeViewModel

export type HistoryItemViewModel = {
  changes: HistoryChangeViewModel[]
  createdAt: string
  issueKey?: null | string
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
