import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { UpdateOrganizationInput } from './OrganizationSettingsPage.types'
import type { OrganizationSettingsPageData } from './OrganizationSettingsPage.types'

export type RemoveOrganization = (input: { id: string }) => Promise<ActionResult<true>>

export type UpdateOrganization = (input: UpdateOrganizationInput) => Promise<ActionResult<true>>

export type ViewOrganizationSettings = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<OrganizationSettingsPageData>>

export type OrganizationSettingsPageDeps = {
  remove: RemoveOrganization
  updateOrganization: UpdateOrganization
  view: ViewOrganizationSettings
}
