import type { ApiClient } from '#infrastructure/api/client'

import type { BillingPageDeps } from '../BillingPage.deps'
import { createViewAdminBillingTransactions } from './viewAdminBillingTransactions'
import { createViewBilling } from './viewBilling'
import { createViewBillingTransactions } from './viewBillingTransactions'

export const createBillingPageDeps = (client: ApiClient): BillingPageDeps => ({
  adminTransactions: { view: createViewAdminBillingTransactions(client) },
  transactions: { view: createViewBillingTransactions(client) },
  view: createViewBilling(client),
})
