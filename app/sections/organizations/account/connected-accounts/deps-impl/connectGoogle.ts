import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { ConnectedAccountsPageDeps } from '../ConnectedAccountsPage.deps'
import { toConnectOutcome } from './toConnectOutcome'

export const createConnectGoogle =
  (client: ApiClient): ConnectedAccountsPageDeps['connectGoogle'] =>
  ({ idToken }) =>
    executeAction({
      map: toConnectOutcome,
      request: () => client.POST('/api/user/connected-accounts/google', { body: { idToken } }),
    })
