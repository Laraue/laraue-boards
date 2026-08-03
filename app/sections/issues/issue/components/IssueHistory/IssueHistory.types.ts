import type { IssueDescriptionDiffLine } from '../IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.types'

export type IssueHistoryChangeViewModel = {
  diff?: IssueDescriptionDiffLine[]
  kind?: 'assignee' | 'board' | 'description' | 'space'
  label: string
  newColor?: null | string
  newValue?: string
  oldColor?: null | string
  oldValue?: string
}

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
