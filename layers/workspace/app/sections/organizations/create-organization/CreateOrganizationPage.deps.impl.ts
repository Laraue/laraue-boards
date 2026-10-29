import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { CreateOrganizationPageDeps } from './CreateOrganizationPage.deps'

export const createCreateOrganizationPageDeps = (
  client: ApiClient,
): CreateOrganizationPageDeps => ({
  create: async (input) => {
    await request(client.POST('/api/organizations', { body: input }))
  },
})
