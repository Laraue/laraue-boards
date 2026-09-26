import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'
import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'

import type { ConnectedAccounts, ConnectOutcome } from './ConnectedAccountsPage.types'

export type ConnectedAccountsPageDeps = {
  connectGoogle: (input: { idToken: string }) => Promise<ActionResult<ConnectOutcome>>
  connectTelegram: (input: TelegramUser) => Promise<ActionResult<ConnectOutcome>>
  view: (input: { signal?: AbortSignal }) => Promise<QueryResult<ConnectedAccounts>>
}
