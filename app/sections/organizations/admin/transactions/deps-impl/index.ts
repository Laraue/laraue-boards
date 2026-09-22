import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationTransactionsPageDeps } from '../OrganizationTransactionsPage.deps'
import { createViewTransactions } from './viewTransactions'

export const createTransactionsPageDeps = (
  client: ApiClient,
): OrganizationTransactionsPageDeps => ({
  view: createViewTransactions(client),
})
