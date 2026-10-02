import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateAttributePageDeps } from './CreateAttributePage.deps.impl'

test('sends list values for a list attribute', async () => {
  const { client, requests } = createTestApiClient(() => 42)

  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { listValues: ['Low', 'High'], type: 'list' },
    name: 'Severity',
  })
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    listValues: [{ name: 'Low' }, { name: 'High' }],
    name: 'Severity',
    type: 'List',
  })
})

test('maps scalar attribute types', async () => {
  const { client, requests } = createTestApiClient(() => 42)

  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { type: 'text' },
    name: 'Priority',
  })
  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { type: 'integer' },
    name: 'Estimate',
  })
  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { type: 'decimal' },
    name: 'Cost',
  })
  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { type: 'date' },
    name: 'Due',
  })
  await createCreateAttributePageDeps(client).create({
    color: '#fff',
    data: { type: 'dateTime' },
    name: 'Starts',
  })

  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Priority',
    type: 'Text',
  })
  assert.deepEqual(await requests[1]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Estimate',
    type: 'Integer',
  })
  assert.deepEqual(await requests[2]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Cost',
    type: 'Decimal',
  })
  assert.deepEqual(await requests[3]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Due',
    type: 'Date',
  })
  assert.deepEqual(await requests[4]!.json(), {
    color: '#fff',
    listValues: null,
    name: 'Starts',
    type: 'DateTime',
  })
})
