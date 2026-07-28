import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { CreateOrganization } from '../CreateOrganizationPage.deps'

export const createCreateOrganization =
  (client: ApiClient): CreateOrganization =>
  (input) =>
    executeAction({
      map: (data) => (data?.id === undefined ? undefined : { organizationId: String(data.id) }),
      request: () => client.POST('/api/organizations', { body: input }),
    })
