import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewUserAccount } from './viewUserAccount'

const user = { palette: [] }

test('reports a signed-in user without loading an organization', async () => {
  const { client, requests } = createTestApiClient(() => user)

  assert.deepEqual(await createViewUserAccount(client)({}), {
    data: { kind: 'signed-in' },
    status: 'success',
  })
  assert.equal(requests.length, 1)
})

test('reports a signed-out visitor instead of an error', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createViewUserAccount(client)({}), {
    data: { kind: 'signed-out' },
    status: 'success',
  })
})
