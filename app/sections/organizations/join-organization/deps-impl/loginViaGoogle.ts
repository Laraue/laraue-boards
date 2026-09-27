import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { LoginViaGoogle } from '../JoinOrganizationPage.deps'

export const createLoginViaGoogle =
  (client: ApiClient): LoginViaGoogle =>
  ({ code, languageCode }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/user/auth-via-google', {
          body: { code, languageCode: languageCode?.split('-')[0]?.toLowerCase() || null },
          parseAs: 'text',
        }),
    })
