import type { BoardSettingsColumnDraft, BoardSettingsPageData } from '../BoardSettingsPage.deps'

export type BoardSettingsFormInput = {
  color: string
  columns: BoardSettingsColumnDraft[]
  name: string
}

export type BoardSettingsFormColumnDraft = BoardSettingsColumnDraft & { key: string }

export type BoardSettingsFormProps = {
  error: null | string
  onUpdate: (input: BoardSettingsFormInput) => void
  submitting: boolean
  viewModel: BoardSettingsPageData
}
