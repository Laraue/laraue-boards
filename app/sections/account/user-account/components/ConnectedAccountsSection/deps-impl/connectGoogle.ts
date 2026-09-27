import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { ConnectedAccountsSectionDeps } from '../ConnectedAccountsSection.deps'
import { toConnectOutcome } from './toConnectOutcome'

export const createConnectGoogle =
  (client: ApiClient): ConnectedAccountsSectionDeps['connectGoogle'] =>
  ({ code }) =>
    executeAction({
      map: toConnectOutcome,
      request: () => client.POST('/api/user/connected-accounts/google', { body: { code } }),
    })
