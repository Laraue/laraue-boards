export type SpaceSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  id: string
  name: string
  spaceKey: string
}

export type UpdateSpaceInput = {
  color: string
  key: string
  name: string
  spaceId: string
}
