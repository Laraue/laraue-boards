import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { LeaveOrganization } from '../OrganizationPickerPage.deps'

export const createLeaveOrganization =
  (client: ApiClient): LeaveOrganization =>
  ({ id }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/organizations/{id}/leave', {
          params: { path: { id: Number(id) } },
        }),
    })
