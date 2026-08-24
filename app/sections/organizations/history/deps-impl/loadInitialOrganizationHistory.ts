import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { OrganizationHistoryPageDeps } from '../OrganizationHistoryPage.deps'
import { mapOrganizationHistoryPage } from './mapOrganizationHistoryPage'

export const createLoadInitialOrganizationHistory =
  (client: ApiClient): OrganizationHistoryPageDeps['loadInitial'] =>
  async ({ dateFrom, dateTo, ownerId, signal }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/organizations/members', { signal }),
        client.POST('/api/organizations/history', {
          body: { dateFrom, dateTo, ownerId, pagination: { page: 0, perPage: 20 } },
          signal,
        }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }

    const [members, history] = responses
    if ('error' in members) {
      return { code: members.response.status, status: 'error' }
    }
    if ('error' in history) {
      return { code: history.response.status, status: 'error' }
    }
    if (!history.data) {
      return { code: 404, status: 'error' }
    }

    return {
      data: {
        history: mapOrganizationHistoryPage(history.data, client.baseUrl),
        users: members.data
          .map((member) => ({ label: member.displayName, value: member.userId }))
          .toSorted((a, b) => a.label.localeCompare(b.label)),
      },
      status: 'success',
    }
  }
