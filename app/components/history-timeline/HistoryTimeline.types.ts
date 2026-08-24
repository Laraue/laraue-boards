import type { RouteLocationRaw } from 'vue-router'

import type { IssueDescriptionDiffLine } from '~/sections/issues/issue/components/IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

export type HistoryDescriptionChangeViewModel = {
  diff: IssueDescriptionDiffLine[]
  kind: 'description'
  label: string
}

export type HistoryAttachmentChangeViewModel = {
  imageUrl: null | string
  kind: 'attachment'
  label: string
  newValue: string
}

export type HistoryEventChangeViewModel = {
  kind: 'event'
  label: string
}

export type HistoryAssigneeChangeViewModel = {
  kind: 'assignee'
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

export type HistoryBoardChangeViewModel = {
  kind: 'board'
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

export type HistoryPropertyChangeViewModel = {
  kind: 'property'
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

export type HistorySpaceChangeViewModel = {
  kind: 'space'
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

export type HistoryStatusChangeViewModel = {
  kind: 'status'
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

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
    color: string
    initials: string
    name: string
  }
}

export type HistoryPageViewModel = {
  hasNextPage: boolean
  items: HistoryItemViewModel[]
}
