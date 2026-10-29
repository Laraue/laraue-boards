import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { OrganizationTransactionsPageDeps } from './OrganizationTransactionsPage.deps'

export const createTransactionsPageDeps = (
  client: ApiClient,
): OrganizationTransactionsPageDeps => ({
  view: async ({ page, signal, userId }) => {
    const [result, members] = await Promise.all([
      request(
        client.POST('/api/admin/organizations/billing/transactions', {
          body: { ...(userId ? { userId } : {}), pagination: { page: page - 1, perPage: 20 } },
          signal,
        }),
      ),
      request(client.GET('/api/admin/organizations/members', { signal })),
    ])
    const memberNames = new Map(members.map((member) => [member.userId, member.displayName]))
    return {
      hasNextPage: result.hasNextPage,
      members: members.map((member) => ({ id: member.userId, name: member.displayName })),
      // A transaction without its owner's name takes it from the member list.
      transactions: result.data.map((transaction) => ({
        createdAt: transaction.createdAt,
        delta: Number(transaction.delta),
        error: transaction.error ?? null,
        finishedAt: transaction.finishedAt ?? null,
        id: transaction.id,
        ownerName:
          transaction.ownerDisplayName ??
          memberNames.get(transaction.ownerUserId) ??
          transaction.ownerUserId,
        reason: transaction.reason,
        status: transaction.status,
      })),
    }
  },
})
