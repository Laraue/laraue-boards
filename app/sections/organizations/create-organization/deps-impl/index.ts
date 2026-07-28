import type { ApiClient } from '#infrastructure/api/client'

import type { CreateOrganizationPageDeps } from '../CreateOrganizationPage.deps'
import { createCreateOrganization } from './createOrganization'

export const createCreateOrganizationPageDeps = (
  client: ApiClient,
): CreateOrganizationPageDeps => ({
  create: createCreateOrganization(client),
})
