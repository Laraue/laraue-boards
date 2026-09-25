import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { LoginViaGoogle } from '../LoginPage.deps'

export const createLoginViaGoogle =
  (client: ApiClient): LoginViaGoogle =>
  ({ idToken, languageCode }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/user/auth-via-google', {
          body: {
            idToken,
            languageCode: languageCode?.split('-')[0]?.toLowerCase() || null,
          },
          parseAs: 'text',
        }),
    })
