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
  // The key when the space isn't among the user's spaces.
  spaceColor: string
  spaceName: string
  status: BoardSettingsStatus
}

export type BoardSettingsColumnDraft = {
  category: StatusCategory
  color: string
  id: null | string
  name: string
}

export type SaveBoardSettingsInput = {
  boardId: string
  color: string
  columns: BoardSettingsColumnDraft[]
  name: string
  originalColumns: BoardSettingsColumn[]
  originalStatus: BoardSettingsStatus
  status: BoardSettingsStatus
}

export type BoardSettingsPageDeps = {
  remove: (input: { boardId: string }) => Promise<void>
  save: (input: SaveBoardSettingsInput) => Promise<void>
  view: (input: {
    boardId: string
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<BoardSettingsPageData>
}
