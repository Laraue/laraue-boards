import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { LoginViaTelegramWidget } from '../LoginPage.deps'

export const createLoginViaTelegramWidget =
  (client: ApiClient): LoginViaTelegramWidget =>
  (input) =>
    executeAction({
      map: () => true,
      request: () => client.POST('/api/user/auth', { body: input, parseAs: 'text' }),
    })
