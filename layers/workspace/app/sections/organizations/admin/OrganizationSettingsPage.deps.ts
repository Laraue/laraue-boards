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

export type OrganizationSettingsPageDeps = {
  remove: (input: { id: string }) => Promise<void>
  updateOrganization: (input: UpdateOrganizationInput) => Promise<void>
  view: (input: { signal?: AbortSignal }) => Promise<OrganizationSettingsPageData>
}
