import type { BoardColumnViewModel } from './components/BoardColumn/BoardColumn.types'
import type { IssueCardViewModel } from './components/BoardColumn/components/IssueCard.types'

export type BoardPageAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type BoardPageFilterValue = {
  attributes: Record<string, string | string[]>
}

export type BoardPageViewModel = {
  attributes: BoardPageAttributeViewModel[]
  canCreateIssues: boolean
  canDelete: boolean
  canMoveIssues: boolean
  canUpdate: boolean
  color: null | string
  columns: BoardColumnViewModel[]
  id: string
  issueCount: number
  title: string
}

export type LoadMoreBoardIssuesResult = {
  hasNext: boolean
  issues: IssueCardViewModel[]
}

export type SearchBoardIssuesResult = {
  columns: Array<{
    hasNext: boolean
    id: string
    issueCount: number
    issues: IssueCardViewModel[]
  }>
  issueCount: number
}

export type IssueFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
