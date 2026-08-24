import type { ApiClient } from '#infrastructure/api/client'

import type { OrganizationHistoryPageDeps } from '../OrganizationHistoryPage.deps'
import { createLoadInitialOrganizationHistory } from './loadInitialOrganizationHistory'
import { createLoadOrganizationHistory } from './loadOrganizationHistory'

export const createOrganizationHistoryPageDeps = (
  client: ApiClient,
): OrganizationHistoryPageDeps => ({
  loadInitial: createLoadInitialOrganizationHistory(client),
  loadPage: createLoadOrganizationHistory(client),
})
