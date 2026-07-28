import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createViewDataMovement } from './viewDataMovement'

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

  assert.deepEqual(await createViewDataMovement(client)({}), {
    data: {
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
    },
    status: 'success',
  })
})

test('treats a missing current organization as access denied', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 404 }))

  assert.deepEqual(await createViewDataMovement(client)({}), { code: 403, status: 'error' })
})
