import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

import type { BoardColumnViewModel } from './components/BoardColumn/BoardColumn.types'
import type { IssueCardViewModel } from './components/BoardColumn/components/IssueCard.types'

export type BoardPageAttributeViewModel = IssueAttributeField

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
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
