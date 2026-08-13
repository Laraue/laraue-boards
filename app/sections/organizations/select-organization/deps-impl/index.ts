import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationPickerPageDeps } from '../OrganizationPickerPage.deps'
import { createOrganizationTourDeps } from './organizationTour'
import { createSelectOrganization } from './selectOrganization'
import { createViewOrganizationPicker } from './viewOrganizationPicker'

export const createOrganizationPickerPageDeps = (
  client: ApiClient,
): OrganizationPickerPageDeps => ({
  select: createSelectOrganization(client),
  tour: createOrganizationTourDeps(client),
  view: createViewOrganizationPicker(client),
})
