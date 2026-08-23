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

test('sends null listValues for scalar attributes', async () => {
  const { client, requests } = createTestApiClient()

  const values = [
    { name: 'Priority', type: 'text' as const },
    { name: 'Estimate', type: 'integer' as const },
    { name: 'Cost', type: 'decimal' as const },
    { name: 'Due', type: 'date' as const },
    { name: 'Starts', type: 'dateTime' as const },
  ]
  for (const value of values) {
    await createUpdateAttribute(client)({
      color: '#fff',
      data: { type: value.type },
      id: '7',
      name: value.name,
    })
  }

  assert.deepEqual(
    await Promise.all(requests.map((request) => request.json())),
    values.map((value) => ({
      color: '#fff',
      id: 7,
      listValues: null,
      name: value.name,
    })),
  )
})
