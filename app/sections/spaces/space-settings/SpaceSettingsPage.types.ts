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
