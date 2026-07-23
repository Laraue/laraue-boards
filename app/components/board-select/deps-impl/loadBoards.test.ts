import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadBoards } from './loadBoards'

test('maps board options', async () => {
  const { client } = createTestApiClient(() => [{ id: 3, name: 'Roadmap' }])

  assert.deepEqual(await createLoadBoards(client)({ spaceId: '2' }), {
    data: [{ label: 'Roadmap', value: '3' }],
    status: 'success',
  })
})
