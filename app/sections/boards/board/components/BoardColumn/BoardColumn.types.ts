import type { IssueCardViewModel } from './components/IssueCard.types'

export type BoardColumnViewModel = {
  color: null | string
  hasNext: boolean
  id: string
  issueCount: number
  issues: IssueCardViewModel[]
  title: string
}
