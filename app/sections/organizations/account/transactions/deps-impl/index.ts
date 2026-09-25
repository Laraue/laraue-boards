import type { ApiClient } from '#infrastructure/api/client'

import type { UserTransactionsPageDeps } from '../UserTransactionsPage.deps'
import { createViewTransactions } from './viewTransactions'

export const createTransactionsPageDeps = (client: ApiClient): UserTransactionsPageDeps => ({
  view: createViewTransactions(client),
})
