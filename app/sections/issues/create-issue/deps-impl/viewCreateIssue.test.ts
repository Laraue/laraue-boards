import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewCreateIssue } from './viewCreateIssue'

test('maps create issue page data', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 3, listValues: [], name: 'Note', type: 'Text' },
  ])

  assert.deepEqual(await createViewCreateIssue(client)({}), {
    data: {
      attributes: [{ color: '#fff', id: '3', name: 'Note', type: 'text' }],
    },
    status: 'success',
  })
})
