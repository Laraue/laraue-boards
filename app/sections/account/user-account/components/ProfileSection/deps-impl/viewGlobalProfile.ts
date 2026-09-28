import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { ViewGlobalProfile } from '../ProfileSection.deps'
import { toGlobalProfile } from './toGlobalProfile'

export const createViewGlobalProfile =
  (client: ApiClient): ViewGlobalProfile =>
  ({ signal }) =>
    executeQuery({
      map: (profile) => profile && toGlobalProfile(profile),
      request: () => client.GET('/api/user/profile', { signal }),
    })
