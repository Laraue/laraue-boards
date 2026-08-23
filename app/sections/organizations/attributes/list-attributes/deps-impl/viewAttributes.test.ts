import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewAttributes } from './viewAttributes'

test('maps attributes response', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 7, name: 'Priority', type: 'Text' },
    { color: '#000', id: 8, listValues: [], name: 'Severity', type: 'List' },
    { color: '#111', id: 9, listValues: [], name: 'Estimate', type: 'Integer' },
    { color: '#222', id: 10, listValues: [], name: 'Cost', type: 'Decimal' },
    { color: '#333', id: 11, listValues: [], name: 'Due', type: 'Date' },
    { color: '#444', id: 12, listValues: [], name: 'Starts', type: 'DateTime' },
  ])

  assert.deepEqual(await createViewAttributes(client)({}), {
    data: [
      { color: '#fff', id: '7', name: 'Priority', type: 'text' },
      { color: '#000', id: '8', name: 'Severity', type: 'list' },
      { color: '#111', id: '9', name: 'Estimate', type: 'integer' },
      { color: '#222', id: '10', name: 'Cost', type: 'decimal' },
      { color: '#333', id: '11', name: 'Due', type: 'date' },
      { color: '#444', id: '12', name: 'Starts', type: 'dateTime' },
    ],
    status: 'success',
  })
})
