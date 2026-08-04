import type { IssueDescriptionDiffLine } from '../IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

type IssueHistoryDescriptionChangeViewModel = {
  diff: IssueDescriptionDiffLine[]
  kind: 'description'
  label: string
}

type IssueHistoryAttachmentChangeViewModel = {
  imageUrl: null | string
  kind: 'attachment'
  label: string
  newValue: string
}

type IssueHistoryEventChangeViewModel = {
  kind: 'event'
  label: string
}

type IssueHistoryValueChangeViewModel<Kind extends string> = {
  kind: Kind
  label: string
  newColor: null | string
  newValue: string
  oldColor: null | string
  oldValue: string
}

type IssueHistoryAssigneeChangeViewModel = IssueHistoryValueChangeViewModel<'assignee'>
type IssueHistoryBoardChangeViewModel = IssueHistoryValueChangeViewModel<'board'>
type IssueHistoryPropertyChangeViewModel = IssueHistoryValueChangeViewModel<'property'>
type IssueHistorySpaceChangeViewModel = IssueHistoryValueChangeViewModel<'space'>
type IssueHistoryStatusChangeViewModel = IssueHistoryValueChangeViewModel<'status'>

export type IssueHistoryChangeViewModel =
  | IssueHistoryAssigneeChangeViewModel
  | IssueHistoryAttachmentChangeViewModel
  | IssueHistoryBoardChangeViewModel
  | IssueHistoryDescriptionChangeViewModel
  | IssueHistoryEventChangeViewModel
  | IssueHistoryPropertyChangeViewModel
  | IssueHistorySpaceChangeViewModel
  | IssueHistoryStatusChangeViewModel

export type IssueHistoryItemViewModel = {
  changes: IssueHistoryChangeViewModel[]
  createdAt: string
  owner: {
    color: string
    initials: string
    name: string
  }
}

export type IssueHistoryPageViewModel = {
  hasNextPage: boolean
  items: IssueHistoryItemViewModel[]
}
