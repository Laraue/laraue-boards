import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationSettingsPageDeps } from '../OrganizationSettingsPage.deps'
import { createUpdateOrganization } from './updateOrganization'
import { createViewOrganizationSettings } from './viewOrganizationSettings'

export const createOrganizationSettingsPageDeps = (
  client: ApiClient,
): OrganizationSettingsPageDeps => ({
  updateOrganization: createUpdateOrganization(client),
  view: createViewOrganizationSettings(client),
})
