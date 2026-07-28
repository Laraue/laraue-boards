export type BoardSettingsColumn = {
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
}

export type BoardSettingsColumnDraft = {
  color: string
  id: null | string
  name: string
}
