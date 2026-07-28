import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateAttribute } from './createAttribute'

test('maps create attribute request and response', async () => {
  const { client, requests } = createTestApiClient(() => 42)

  assert.deepEqual(
    await createCreateAttribute(client)({
      color: '#fff',
      data: { listValues: ['Low', 'High'], type: 'list' },
      name: 'Severity',
    }),
    { data: { id: '42' }, status: 'success' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    listValues: [{ name: 'Low' }, { name: 'High' }],
    name: 'Severity',
    type: 1,
  })
})

test('sends null listValues and type 0 for text attributes', async () => {
  const { client, requests } = createTestApiClient(() => 42)

  await createCreateAttribute(client)({ color: '#fff', data: { type: 'text' }, name: 'Priority' })

  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Priority',
    type: 0,
  })
})
