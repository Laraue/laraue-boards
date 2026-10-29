import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { mapHistoryPage } from '#layers/workspace/app/shared/components/HistoryTimeline/api/mapHistoryPage'

import type { OrganizationHistoryPageDeps } from './OrganizationHistoryPage.deps'

export const createOrganizationHistoryPageDeps = (
  client: ApiClient,
): OrganizationHistoryPageDeps => {
  const loadHistory = async (
    { dateFrom, dateTo, ownerId }: { dateFrom?: string; dateTo?: string; ownerId?: string },
    page: number,
    signal?: AbortSignal,
  ) =>
    mapHistoryPage(
      await request(
        client.POST('/api/organizations/history', {
          body: { dateFrom, dateTo, ownerId, pagination: { page, perPage: 20 } },
          signal,
        }),
      ),
      client.baseUrl,
    )

  return {
    loadInitial: async ({ signal, ...filters }) => {
      const [members, history] = await Promise.all([
        request(client.GET('/api/organizations/members', { signal })),
        loadHistory(filters, 0, signal),
      ])
      return {
        history,
        users: members
          .map((member) => ({ label: member.displayName, value: member.userId }))
          .toSorted((a, b) => a.label.localeCompare(b.label)),
      }
    },
    loadPage: ({ page, ...filters }) => loadHistory(filters, page),
  }
}
