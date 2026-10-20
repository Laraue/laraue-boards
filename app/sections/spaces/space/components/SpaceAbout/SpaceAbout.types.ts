export type SpaceLinkViewModel = {
  description: string
  id: string
  url: string
}

export type SpaceAboutViewModel = {
  canEdit: boolean
  // Markdown, or null when the space has none.
  description: null | string
  links: SpaceLinkViewModel[]
}
