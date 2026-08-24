import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { OrganizationHistoryPageDeps } from '../OrganizationHistoryPage.deps'
import { mapOrganizationHistoryPage } from './mapOrganizationHistoryPage'

export const createLoadOrganizationHistory =
  (client: ApiClient): OrganizationHistoryPageDeps['loadPage'] =>
  ({ dateFrom, dateTo, ownerId, page, signal }) =>
    executeQuery({
      map: (result) => result && mapOrganizationHistoryPage(result, client.baseUrl),
      request: () =>
        client.POST('/api/organizations/history', {
          body: {
            dateFrom,
            dateTo,
            ownerId,
            pagination: { page, perPage: 20 },
          },
          signal,
        }),
    })
