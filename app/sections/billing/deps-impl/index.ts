import type { ApiClient } from '#infrastructure/api/client'

import type { BillingPageDeps } from '../BillingPage.deps'
import { createViewBilling } from './viewBilling'

export const createBillingPageDeps = (client: ApiClient): BillingPageDeps => ({
  view: createViewBilling(client),
})
