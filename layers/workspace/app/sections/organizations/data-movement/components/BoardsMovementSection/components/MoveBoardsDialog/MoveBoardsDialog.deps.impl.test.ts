import { assert, expect, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoardsDialogDeps } from './MoveBoardsDialog.deps.impl'

test('waits for every board move before reporting a failure', async () => {
  let finish!: (response: Response) => void
  const remaining = new Promise<Response>((resolve) => (finish = resolve))
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockReturnValueOnce(remaining)
  const client = createApiClient({ baseUrl: 'https://api.test', fetch })
  let settled = false
  const result = createMoveBoardsDialogDeps(client)
    .moveBoards({
      boardIds: ['21', '22'],
      destinationOrganizationId: '2',
      destinationSpaceKey: 'product',
    })
    .catch((error: unknown) => error)
    .finally(() => (settled = true))

  try {
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(settled).toBe(false)
  } finally {
    finish(new Response(null, { status: 204 }))
  }
  await expect(result).resolves.toMatchObject({ status: 503 })
})

test('rejects moving boards without a selection', async () => {
  const { client, requests } = createTestApiClient()

  await expect(
    createMoveBoardsDialogDeps(client).moveBoards({
      boardIds: [],
      destinationOrganizationId: '',
      destinationSpaceKey: '',
    }),
  ).rejects.toMatchObject({ status: 400 })
  assert.equal(requests.length, 0)
})

test('moves every selected board to the space', async () => {
  const { client, paths, requests } = createTestApiClient()

  await createMoveBoardsDialogDeps(client).moveBoards({
    boardIds: ['21', '22'],
    destinationOrganizationId: '2',
    destinationSpaceKey: 'product',
  })

  assert.deepEqual(paths(), ['/api/movement/move-epic', '/api/movement/move-epic'])
  assert.deepEqual(await Promise.all(requests.map((request) => request.json())), [
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 21 },
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 22 },
  ])
})
