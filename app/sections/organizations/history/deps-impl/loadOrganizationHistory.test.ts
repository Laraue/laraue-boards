import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadOrganizationHistory } from './loadOrganizationHistory'

test('loads filtered organization history', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        action: 'Create',
        changes: [],
        createdAt: '2026-08-24T10:00:00Z',
        entityType: 'Issue',
        issueKey: 'WEB-12',
        owner: { color: '#111', displayName: 'Ada', initials: 'A' },
      },
    ],
    hasNextPage: false,
  }))

  const result = await createLoadOrganizationHistory(client)({
    dateFrom: '2026-08-01T00:00:00.000Z',
    dateTo: '2026-08-24T23:59:59.999Z',
    ownerId: '00000000-0000-0000-0000-000000000001',
    page: 0,
  })

  assert.equal(result.status, 'success')
  assert.equal(result.status === 'success' && result.data.items[0]?.issueKey, 'WEB-12')
  assert.deepEqual(await requests[0]!.json(), {
    dateFrom: '2026-08-01T00:00:00.000Z',
    dateTo: '2026-08-24T23:59:59.999Z',
    ownerId: '00000000-0000-0000-0000-000000000001',
    pagination: { page: 0, perPage: 20 },
  })
})
