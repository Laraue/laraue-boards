import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { DEFAULT_COLOR } from '~/constants/colors'

import { createViewOrganizationSettings } from './viewOrganizationSettings'

test('maps API responses to organization settings data', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path.endsWith('/current')
      ? {
          canCreateSpaces: true,
          canManage: true,
          canManageAttributes: true,
          canMassMove: true,
          color: null,
          id: 7,
          name: 'Acme',
          slug: 'acme',
          slugPostfix: '42',
        }
      : [
          {
            canCreateSpaces: true,
            canDelete: false,
            canUpdate: true,
            color: null,
            id: 7,
            isPersonal: false,
            name: 'Acme',
            slug: 'acme',
            slugPostfix: '42',
          },
        ],
  )

  assert.deepEqual(await createViewOrganizationSettings(client)({}), {
    data: {
      canDelete: false,
      canLeave: true,
      canUpdate: true,
      color: DEFAULT_COLOR,
      id: '7',
      name: 'Acme',
      slug: 'acme',
    },
    status: 'success',
  })
})

test('returns error status when a request fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(await createViewOrganizationSettings(client)({}), { code: 403, status: 'error' })
})
