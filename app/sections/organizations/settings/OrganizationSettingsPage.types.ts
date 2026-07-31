export type OrganizationSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  id: string
  name: string
  slug: string
}

export type UpdateOrganizationInput = {
  color: string
  id: string
  name: string
  slug: string
}
