import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { ConnectedAccountsPageDeps } from '../ConnectedAccountsPage.deps'

export const createViewConnectedAccounts =
  (client: ApiClient): ConnectedAccountsPageDeps['view'] =>
  ({ signal }) =>
    executeQuery({
      map: (user) =>
        user && {
          google: user.hasGoogleAccount ?? false,
          telegram: user.telegramId !== null && user.telegramId !== undefined,
        },
      request: () => client.GET('/api/user', { signal }),
    })
