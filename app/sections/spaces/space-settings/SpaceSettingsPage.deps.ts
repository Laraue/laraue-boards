export type SpaceLinkItem = {
  description: string
  id: string
  url: string
}

// A link as edited on the page: without an id until it's saved.
export type SpaceLinkDraft = {
  description: string
  id?: string
  url: string
}

export type SpaceSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  description: string
  links: SpaceLinkItem[]
  name: string
}

export type SaveSpaceSettingsInput = {
  color: string
  description: string
  links: SpaceLinkDraft[]
  name: string
  newKey: string
  oldKey: string
}

export type SpaceSettingsPageDeps = {
  remove: (input: { spaceKey: string }) => Promise<void>
  save: (input: SaveSpaceSettingsInput) => Promise<void>
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<SpaceSettingsPageData>
}
