import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { UpdateOrganizationInput } from './OrganizationSettingsPage.types'
import type { OrganizationSettingsPageData } from './OrganizationSettingsPage.types'

export type UpdateOrganization = (input: UpdateOrganizationInput) => Promise<ActionResult<true>>

export type ViewOrganizationSettings = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<OrganizationSettingsPageData>>

export type OrganizationSettingsPageDeps = {
  updateOrganization: UpdateOrganization
  view: ViewOrganizationSettings
}
