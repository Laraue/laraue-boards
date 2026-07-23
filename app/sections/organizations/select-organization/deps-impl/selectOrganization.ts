import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { SelectOrganization } from '../OrganizationPickerPage.deps'

export const createSelectOrganization =
  (client: ApiClient): SelectOrganization =>
  ({ organizationId }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/organizations/login', {
          body: { organizationId },
          parseAs: 'text',
        }),
    })
