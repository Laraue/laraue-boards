export type SpaceLinkItem = {
  description: string
  id: string
  url: string
}

export type SpaceAboutSettingsData = {
  canEdit: boolean
  description: string
  links: SpaceLinkItem[]
}

export type SpaceLinkInput = {
  description: string
  url: string
}
