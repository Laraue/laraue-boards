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
  const signedOut = createTestApiClient(() => new Response(null, { status: 401 }))
  const forbidden = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(await createViewAppLayout(signedOut.client)({ organizationKey: 'acme-AB12' }), {
    problem: { kind: 'signed-out' },
    status: 'problem',
  })
  assert.deepEqual(await createViewAppLayout(forbidden.client)({ organizationKey: 'acme-AB12' }), {
    problem: { kind: 'no-access' },
    status: 'problem',
  })
})

test('reports a server failure as a failed load rather than a missing organization', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 503 }))

  assert.deepEqual(await createViewAppLayout(client)({ organizationKey: 'acme-AB12' }), {
    problem: { code: 503, kind: 'load-failed' },
    status: 'problem',
  })
})

test('selects the organization from the url when only the organization cookie is missing', async () => {
  let organizationSelected = false
  const { client, paths } = createTestApiClient((_request, path) => {
    switch (path) {
      case '/api/organizations/current':
        return organizationSelected
          ? {
              canCreateSpaces: true,
              canManage: true,
              canManageAttributes: true,
              canMassMove: false,
              color: '#123',
              id: 1,
              name: 'Acme',
            }
          : new Response(null, { status: 401 })
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
      case '/api/organizations/login':
        organizationSelected = true
        return new Response('ok')
      case '/api/user':
        return { color: '#456', firstName: 'Ada', initials: 'AL', lastName: 'Lovelace' }
      case '/api/spaces':
        return []
      default:
        return new Response(null, { status: 404 })
    }
  })

  const result = await createViewAppLayout(client)({ organizationKey: 'acme-AB12' })

  assert.equal(result.status, 'success')
  assert.include(paths(), '/api/organizations/login')
})
