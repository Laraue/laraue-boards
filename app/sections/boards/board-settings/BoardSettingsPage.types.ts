import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'

export type BoardSettingsStatus = 'Active' | 'Done' | 'New'

export type BoardSettingsColumn = {
  category: StatusCategory
  color: string
  id: string
  name: string
}

export type BoardSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  columns: BoardSettingsColumn[]
  name: string
  status: BoardSettingsStatus
}

export type BoardSettingsColumnDraft = {
  category: StatusCategory
  color: string
  id: null | string
  name: string
}
