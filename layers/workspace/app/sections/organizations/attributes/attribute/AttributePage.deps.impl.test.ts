import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createAttributePageDeps } from './AttributePage.deps.impl'

test('maps a text attribute', async () => {
  const { client } = createTestApiClient(() => [
    {
      color: '#fff',
      id: 7,
      isEnabled: true,
      listValues: [],
      name: 'Priority',
      showOnCard: false,
      type: 'Text',
    },
  ])

  assert.deepEqual(await createAttributePageDeps(client).view({ attributeId: '7' }), {
    color: '#fff',
    data: { type: 'text' },
    id: '7',
    isEnabled: true,
    name: 'Priority',
    showOnCard: false,
  })
})

test('maps a date-time attribute', async () => {
  const { client } = createTestApiClient(() => [
    {
      color: '#fff',
      id: 7,
      isEnabled: false,
      listValues: [],
      name: 'Starts',
      showOnCard: false,
      type: 'DateTime',
    },
  ])

  assert.deepEqual(await createAttributePageDeps(client).view({ attributeId: '7' }), {
    color: '#fff',
    data: { type: 'dateTime' },
    id: '7',
    isEnabled: false,
    name: 'Starts',
    showOnCard: false,
  })
})

test('maps a list attribute', async () => {
  const { client } = createTestApiClient(() => [
    {
      color: '#fff',
      id: 7,
      isEnabled: true,
      listValues: [
        { id: 1, name: 'Low' },
        { id: 2, name: 'High' },
      ],
      name: 'Severity',
      showOnCard: true,
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
    isEnabled: true,
    name: 'Severity',
    showOnCard: true,
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
    isEnabled: false,
    name: 'Severity',
    showOnCard: true,
  })
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    id: 7,
    isEnabled: false,
    listValues: [{ id: 1, name: 'Low' }],
    name: 'Severity',
    showOnCard: true,
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
      isEnabled: true,
      name: value.name,
      showOnCard: true,
    })
  }

  assert.deepEqual(
    await Promise.all(requests.map((request) => request.json())),
    values.map((value) => ({
      color: '#fff',
      id: 7,
      isEnabled: true,
      listValues: null,
      name: value.name,
      showOnCard: true,
    })),
  )
})
