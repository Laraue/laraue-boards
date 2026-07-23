import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewAttribute } from './viewAttribute'

test('maps a text attribute', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 7, name: 'Priority', type: 0 },
  ])

  assert.deepEqual(await createViewAttribute(client)({ attributeId: '7' }), {
    data: { color: '#fff', data: { type: 'text' }, id: '7', name: 'Priority' },
    status: 'success',
  })
})

test('maps a list attribute', async () => {
  const { client } = createTestApiClient(() => [
    {
      color: '#fff',
      id: 7,
      listValues: [
        { id: 1, name: 'Low' },
        { id: 2, name: 'High' },
      ],
      name: 'Severity',
      type: 1,
    },
  ])

  assert.deepEqual(await createViewAttribute(client)({ attributeId: '7' }), {
    data: {
      color: '#fff',
      data: {
        listValues: [
          { id: '1', name: 'Low' },
          { id: '2', name: 'High' },
        ],
        type: 'list',
      },
      id: '7',
      name: 'Severity',
    },
    status: 'success',
  })
})

test('reports an error instead of throwing when the list has no such attribute', async () => {
  const { client } = createTestApiClient(() => [])

  assert.deepEqual(await createViewAttribute(client)({ attributeId: '7' }), {
    code: 404,
    status: 'error',
  })
})
