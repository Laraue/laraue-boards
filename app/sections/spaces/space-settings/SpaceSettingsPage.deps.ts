// Every dep resolves with its data or rejects with an `ApiError`.

export type SpaceSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  name: string
  spaceKey: string
}

export type UpdateSpaceInput = {
  color: string
  name: string
  newKey: string
  oldKey: string
}

export type SpaceSettingsPageDeps = {
  remove: (input: { spaceKey: string }) => Promise<void>
  update: (input: UpdateSpaceInput) => Promise<void>
  view: (input: { signal?: AbortSignal; spaceKey: string }) => Promise<SpaceSettingsPageData>
}
