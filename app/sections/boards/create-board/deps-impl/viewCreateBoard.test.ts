import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewCreateBoard } from './viewCreateBoard'

test('loads boards with statuses from the current space', async () => {
  const { client, requests } = createTestApiClient(() =>
    Response.json({
      data: [
        {
          epicColor: '#123',
          epicId: 7,
          epicName: 'Roadmap',
          statuses: [{ color: '#456', id: 8, name: 'To do', sortOrder: 1 }],
        },
      ],
      hasNextPage: false,
      page: 0,
      perPage: 100,
    }),
  )

  assert.deepEqual(await createViewCreateBoard(client)({ spaceKey: 'product' }), {
    data: {
      boards: [
        {
          label: 'Roadmap',
          statuses: [{ color: '#456', name: 'To do' }],
          value: '7',
        },
      ],
    },
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), {
    pagination: { page: 0, perPage: 100 },
    spaceKey: 'product',
  })
})
