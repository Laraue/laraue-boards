import { assert, expect, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveSpacesDialogDeps } from './MoveSpacesDialog.deps.impl'

test('waits for every space move before reporting a failure', async () => {
  let finish!: (response: Response) => void
  const remaining = new Promise<Response>((resolve) => (finish = resolve))
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockReturnValueOnce(remaining)
  const client = createApiClient({ baseUrl: 'https://api.test', fetch })
  let settled = false
  const result = createMoveSpacesDialogDeps(client)
    .moveSpaces({ destinationOrganizationId: '2', spaceKeys: ['web', 'product'] })
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

test('rejects moving spaces without a destination', async () => {
  const { client, requests } = createTestApiClient()

  await expect(
    createMoveSpacesDialogDeps(client).moveSpaces({ destinationOrganizationId: '', spaceKeys: [] }),
  ).rejects.toMatchObject({ status: 400 })
  assert.equal(requests.length, 0)
})

test('moves every selected space to the organization', async () => {
  const { client, paths } = createTestApiClient()

  await createMoveSpacesDialogDeps(client).moveSpaces({
    destinationOrganizationId: '2',
    spaceKeys: ['web', 'product'],
  })

  assert.deepEqual(paths(), [
    '/api/movement/space/web/to-organization/2',
    '/api/movement/space/product/to-organization/2',
  ])
})
