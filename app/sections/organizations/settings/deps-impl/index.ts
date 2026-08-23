import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationSettingsPageDeps } from '../OrganizationSettingsPage.deps'
import { createLeaveOrganization } from './leaveOrganization'
import { createRemoveOrganization } from './removeOrganization'
import { createUpdateOrganization } from './updateOrganization'
import { createViewOrganizationSettings } from './viewOrganizationSettings'

export const createOrganizationSettingsPageDeps = (
  client: ApiClient,
): OrganizationSettingsPageDeps => ({
  leave: createLeaveOrganization(client),
  remove: createRemoveOrganization(client),
  updateOrganization: createUpdateOrganization(client),
  view: createViewOrganizationSettings(client),
})
