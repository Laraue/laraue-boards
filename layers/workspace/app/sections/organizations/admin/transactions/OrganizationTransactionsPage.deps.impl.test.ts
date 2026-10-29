import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createTransactionsPageDeps } from './OrganizationTransactionsPage.deps.impl'

test('loads organization transactions, owners, and member filter options', async () => {
  const { client, paths, requests } = createTestApiClient((_request, path) => {
    if (path === '/api/admin/organizations/billing/transactions') {
      return {
        data: [
          {
            createdAt: '2026-09-19T10:00:00Z',
            delta: 100,
            error: null,
            finishedAt: null,
            id: 'transaction-1',
            ownerDisplayName: null,
            ownerUserId: 'user-1',
            reason: 'TariffGrant',
            status: 'Confirmed',
          },
        ],
        hasNextPage: false,
        page: 0,
        perPage: 20,
      }
    }
    return [
      {
        adminAccessLevel: 'None',
        color: '#123',
        displayName: 'Ada Lovelace',
        initials: 'AL',
        isOwner: false,
        organizationUserId: 1,
        userId: 'user-1',
      },
    ]
  })

  const result = await createTransactionsPageDeps(client).view({
    page: 1,
    userId: 'user-1',
  })

  assert.deepEqual(result, {
    hasNextPage: false,
    members: [{ id: 'user-1', name: 'Ada Lovelace' }],
    transactions: [
      {
        createdAt: '2026-09-19T10:00:00Z',
        delta: 100,
        error: null,
        finishedAt: null,
        id: 'transaction-1',
        ownerName: 'Ada Lovelace',
        reason: 'TariffGrant',
        status: 'Confirmed',
      },
    ],
  })
  assert.include(paths(), '/api/admin/organizations/billing/transactions')
  assert.include(paths(), '/api/admin/organizations/members')
  assert.deepEqual(await requests[0]!.json(), {
    pagination: { page: 0, perPage: 20 },
    userId: 'user-1',
  })
})
