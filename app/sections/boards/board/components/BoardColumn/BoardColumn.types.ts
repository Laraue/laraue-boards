import type { components } from '#infrastructure/api/generated'

import type { IssueCardViewModel } from './components/IssueCard.types'

export type BoardColumnViewModel = {
  category?: components['schemas']['StatusCategory']
  color: null | string
  hasNext: boolean
  id: string
  issueCount: number
  issues: IssueCardViewModel[]
  title: string
}
