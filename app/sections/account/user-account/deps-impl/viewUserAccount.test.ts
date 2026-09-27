import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewUserAccount } from './viewUserAccount'

const user = { color: '#3568d4', displayName: 'Ann Lee', initials: 'AL', palette: [] }

test('maps the user and the organization they worked in last', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/user' ? user : { name: 'Laraue', slug: 'laraue', slugPostfix: 'HF2P0' },
  )

  assert.deepEqual(await createViewUserAccount(client)({}), {
    data: {
      kind: 'signed-in',
      lastOrganization: { key: 'laraue-HF2P0', name: 'Laraue' },
      user: { color: '#3568d4', initials: 'AL', name: 'Ann Lee' },
    },
    status: 'success',
  })
})

test('has no organization to go back to when none is selected', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/user' ? user : new Response(null, { status: 404 }),
  )

  const result = await createViewUserAccount(client)({})

  assert.equal(
    result.status === 'success' && result.data.kind === 'signed-in' && result.data.lastOrganization,
    null,
  )
})

test('reports a signed-out visitor instead of an error', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createViewUserAccount(client)({}), {
    data: { kind: 'signed-out' },
    status: 'success',
  })
})
