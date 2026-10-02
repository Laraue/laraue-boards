import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createDataMovementPageDeps } from './DataMovementPage.deps.impl'

test('maps movable spaces and boards', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path.endsWith('/organizations/current')) {
      return { canMassMove: true, id: 1, name: 'Current' }
    }
    if (path.endsWith('/spaces')) {
      return [{ color: COLORS.gray, isDefault: false, key: 'development', name: 'Development' }]
    }
    return [
      { color: COLORS.amber, id: 20, isDefault: true, name: 'Backlog' },
      { color: COLORS.coral, id: 21, isDefault: false, name: 'Board' },
    ]
  })

  assert.deepEqual(await createDataMovementPageDeps(client).view({}), {
    currentOrganizationId: '1',
    currentOrganizationName: 'Current',
    spaces: [
      {
        boards: [{ color: COLORS.coral, id: '21', name: 'Board' }],
        color: COLORS.gray,
        isDefault: false,
        key: 'development',
        name: 'Development',
      },
    ],
  })
})

test('treats a missing current organization as access denied', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 404 }))

  await expect(createDataMovementPageDeps(client).view({})).rejects.toMatchObject({ status: 403 })
})
