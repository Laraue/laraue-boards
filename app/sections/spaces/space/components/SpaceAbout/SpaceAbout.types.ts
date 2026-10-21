export type SpaceLinkViewModel = {
  description: string
  id: string
  url: string
}

export type SpaceAboutViewModel = {
  // Markdown, or null when the space has none.
  description: null | string
  links: SpaceLinkViewModel[]
}
