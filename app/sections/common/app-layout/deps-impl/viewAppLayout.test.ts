import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewAppLayout } from './viewAppLayout'

test('loads the requested organization layout', async () => {
  const { client } = createTestApiClient((_request, path) => {
    switch (path) {
      case '/api/organizations/current':
        return {
          canCreateSpaces: true,
          canManage: true,
          canManageAttributes: true,
          canMassMove: false,
          color: '#123',
          id: 1,
          name: 'Acme',
        }
      case '/api/organizations':
        return [
          {
            canUpdate: true,
            id: 1,
            isPersonal: false,
            name: 'Acme',
            slug: 'acme',
            slugPostfix: 'AB12',
          },
        ]
      case '/api/user':
        return { color: '#456', firstName: 'Ada', initials: 'AL', lastName: 'Lovelace' }
      case '/api/spaces':
        return [{ color: '#789', isDefault: false, key: 'DEV', name: 'Development' }]
      default:
        return new Response(null, { status: 404 })
    }
  })

  assert.deepEqual(await createViewAppLayout(client)({ organizationKey: 'acme-AB12' }), {
    data: {
      organization: {
        canCreateSpaces: true,
        canManage: true,
        canManageAttributes: true,
        canMassMove: false,
        canUpdate: true,
        color: '#123',
        id: '1',
        initial: 'A',
        name: 'Acme',
      },
      spaces: [{ color: '#789', key: 'DEV', name: 'Development' }],
      user: { color: '#456', initials: 'AL', name: 'Ada Lovelace' },
    },
    status: 'success',
  })
})

test('keeps an unauthenticated response distinct from forbidden access', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createViewAppLayout(client)({ organizationKey: 'acme-AB12' }), {
    code: 401,
    status: 'error',
  })
})
