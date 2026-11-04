import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'
import type {
  AttributeSettingsSave,
  AttributeSettingsView,
} from '#layers/workspace/app/shared/components/AttributeSettings/AttributeSettings.types'

export type BoardSettingsColumn = {
  category: StatusCategory
  color: string
  id: string
  name: string
}

export type BoardSettingsPageData = {
  attributeSettings: AttributeSettingsView
  canDelete: boolean
  canUpdate: boolean
  color: string
  columns: BoardSettingsColumn[]
  isDefault: boolean
  name: string
  // The key when the space isn't among the user's spaces.
  spaceColor: string
  spaceName: string
}

export type BoardSettingsColumnDraft = {
  category: StatusCategory
  color: string
  id: null | string
  name: string
}

export type SaveBoardSettingsInput = {
  // Null leaves the board's attribute settings as they are.
  attributeSettings: AttributeSettingsSave | null
  boardId: string
  color: string
  // Every column in order: one without an id is added, a saved one left out is deleted with its issues.
  columns: BoardSettingsColumnDraft[]
  name: string
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
