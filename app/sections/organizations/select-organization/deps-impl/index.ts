import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationPickerPageDeps } from '../OrganizationPickerPage.deps'
import { createSelectOrganization } from './selectOrganization'
import { createViewOrganizationPicker } from './viewOrganizationPicker'

export const createOrganizationPickerPageDeps = (
  client: ApiClient,
): OrganizationPickerPageDeps => ({
  select: createSelectOrganization(client),
  view: createViewOrganizationPicker(client),
})
