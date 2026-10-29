import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createAttributePageDeps } from './AttributePage.deps.impl'

test('maps a text attribute', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 7, name: 'Priority', type: 'Text' },
  ])

  assert.deepEqual(await createAttributePageDeps(client).view({ attributeId: '7' }), {
    color: '#fff',
    data: { type: 'text' },
    id: '7',
    name: 'Priority',
  })
})

test('maps a date-time attribute', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 7, listValues: [], name: 'Starts', type: 'DateTime' },
  ])

  assert.deepEqual(await createAttributePageDeps(client).view({ attributeId: '7' }), {
    color: '#fff',
    data: { type: 'dateTime' },
    id: '7',
    name: 'Starts',
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
      type: 'List',
    },
  ])

  assert.deepEqual(await createAttributePageDeps(client).view({ attributeId: '7' }), {
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
  })
})

test('fails with 404 when the list has no such attribute', async () => {
  const { client } = createTestApiClient(() => [])

  await expect(createAttributePageDeps(client).view({ attributeId: '7' })).rejects.toMatchObject({
    status: 404,
  })
})

test('sends list values for a list attribute', async () => {
  const { client, requests } = createTestApiClient()

  await createAttributePageDeps(client).update({
    color: '#fff',
    data: { listValues: [{ id: '1', name: 'Low' }], type: 'list' },
    id: '7',
    name: 'Severity',
  })
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
    await createAttributePageDeps(client).update({
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
