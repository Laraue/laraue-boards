import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationPickerPageDeps } from '../OrganizationPickerPage.deps'
import { createLeaveOrganization } from './leaveOrganization'
import { createOrganizationTourDeps } from './organizationTour'
import { createSelectOrganization } from './selectOrganization'
import { createViewOrganizationPicker } from './viewOrganizationPicker'

export const createOrganizationPickerPageDeps = (
  client: ApiClient,
): OrganizationPickerPageDeps => ({
  leave: createLeaveOrganization(client),
  select: createSelectOrganization(client),
  tour: createOrganizationTourDeps(client),
  view: createViewOrganizationPicker(client),
})
