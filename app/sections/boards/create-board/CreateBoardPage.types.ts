import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

export type CreateBoardInput = {
  color: string
  name: string
  spaceKey: string
  statuses?: Array<{ category: StatusCategory; color: string; name: string }>
}

export type CreateBoardPageData = {
  boards: Array<{
    label: string
    statuses: Array<{ category: StatusCategory; color: string; name: string }>
    value: string
  }>
}
