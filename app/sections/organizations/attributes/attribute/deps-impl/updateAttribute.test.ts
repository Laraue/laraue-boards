import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateAttribute } from './updateAttribute'

test('maps update attribute request and response', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(
    await createUpdateAttribute(client)({
      color: '#fff',
      data: { listValues: [{ id: '1', name: 'Low' }], type: 'list' },
      id: '7',
      name: 'Severity',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    id: 7,
    listValues: [{ id: '1', name: 'Low' }],
    name: 'Severity',
  })
})

test('sends null listValues for text attributes', async () => {
  const { client, requests } = createTestApiClient()

  await createUpdateAttribute(client)({
    color: '#fff',
    data: { type: 'text' },
    id: '7',
    name: 'Priority',
  })

  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    id: 7,
    listValues: null,
    name: 'Priority',
  })
})
