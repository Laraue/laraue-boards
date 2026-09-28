import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { ViewMemberProfile } from '../MemberProfilePage.deps'

export const createViewMemberProfile =
  (client: ApiClient): ViewMemberProfile =>
  ({ signal }) =>
    executeQuery({
      map: (organization) =>
        organization && {
          color: organization.memberProfile.color,
          displayName: organization.memberProfile.displayName,
        },
      request: () => client.GET('/api/organizations/current', { signal }),
    })
