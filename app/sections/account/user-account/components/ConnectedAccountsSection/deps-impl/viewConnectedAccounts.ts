import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { ConnectedAccountsSectionDeps } from '../ConnectedAccountsSection.deps'

export const createViewConnectedAccounts =
  (client: ApiClient): ConnectedAccountsSectionDeps['view'] =>
  ({ signal }) =>
    executeQuery({
      map: (user) =>
        user && {
          google: user.hasGoogleAccount ?? false,
          telegram: user.telegramId !== null && user.telegramId !== undefined,
        },
      request: () => client.GET('/api/user', { signal }),
    })
