import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { ConnectedAccountsPageDeps } from '../ConnectedAccountsPage.deps'
import { toConnectOutcome } from './toConnectOutcome'

export const createConnectTelegram =
  (client: ApiClient): ConnectedAccountsPageDeps['connectTelegram'] =>
  (input) =>
    executeAction({
      map: toConnectOutcome,
      request: () => client.POST('/api/user/connected-accounts/telegram', { body: input }),
    })
