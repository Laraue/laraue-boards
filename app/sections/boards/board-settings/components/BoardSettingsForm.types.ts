import type {
  BoardSettingsColumnDraft,
  BoardSettingsPageData,
  BoardSettingsStatus,
} from '../BoardSettingsPage.deps'

export type BoardSettingsFormInput = {
  color: string
  columns: BoardSettingsColumnDraft[]
  name: string
  status: BoardSettingsStatus
}

export type BoardSettingsFormColumnDraft = BoardSettingsColumnDraft & { key: string }

export type BoardSettingsFormProps = {
  error: null | string
  onUpdate: (input: BoardSettingsFormInput) => void
  submitting: boolean
  viewModel: BoardSettingsPageData
}
