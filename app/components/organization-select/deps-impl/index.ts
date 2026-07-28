import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationSelectDeps } from '../OrganizationSelect.deps'
import { createLoadOrganizations } from './loadOrganizations'

export const createOrganizationSelectDeps = (client: ApiClient): OrganizationSelectDeps => ({
  loadOrganizations: createLoadOrganizations(client),
})
