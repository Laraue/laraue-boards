import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveSpaces } from './moveSpaces'

test('rejects moving spaces without a destination', async () => {
  const { client } = createTestApiClient()

  assert.deepEqual(
    await createMoveSpaces(client)({ destinationOrganizationId: '', spaceIds: [] }),
    {
      code: 400,
      status: 'error',
    },
  )
})

test('moves every selected space to the organization', async () => {
  const { client, paths } = createTestApiClient()

  assert.deepEqual(
    await createMoveSpaces(client)({ destinationOrganizationId: '2', spaceIds: ['10', '11'] }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), [
    '/api/movement/space/10/to-organization/2',
    '/api/movement/space/11/to-organization/2',
  ])
})

test('returns error status when moving spaces fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(
    await createMoveSpaces(client)({ destinationOrganizationId: '2', spaceIds: ['10'] }),
    { code: 403, status: 'error' },
  )
})
