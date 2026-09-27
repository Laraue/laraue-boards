import type { ApiClient } from '#infrastructure/api/client'

import type { ConnectedAccountsPageDeps } from '../ConnectedAccountsPage.deps'
import { createConnectGoogle } from './connectGoogle'
import { createConnectTelegram } from './connectTelegram'
import { createViewConnectedAccounts } from './viewConnectedAccounts'

export const createConnectedAccountsPageDeps = (client: ApiClient): ConnectedAccountsPageDeps => ({
  connectGoogle: createConnectGoogle(client),
  connectTelegram: createConnectTelegram(client),
  view: createViewConnectedAccounts(client),
})
