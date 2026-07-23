import type { BoardSettingsColumnDraft, BoardSettingsPageData } from '../BoardSettingsPage.types'

export type BoardSettingsFormInput = {
  color: string
  columns: BoardSettingsColumnDraft[]
  name: string
}

export type BoardSettingsFormColumnDraft = BoardSettingsColumnDraft & { key: string }

export type BoardSettingsFormProps = {
  error: null | string
  onDelete: () => void
  onUpdate: (input: BoardSettingsFormInput) => void
  submitting: boolean
  viewModel: BoardSettingsPageData
}
