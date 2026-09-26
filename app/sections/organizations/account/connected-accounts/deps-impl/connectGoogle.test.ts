import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createConnectGoogle } from './connectGoogle'

test('sends the ID token and maps the outcome', async () => {
  const { client, requests } = createTestApiClient(() => ({ outcome: 'OwnerHasData' }))

  assert.deepEqual(await createConnectGoogle(client)({ idToken: 'google-id-token' }), {
    data: 'owner-has-data',
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { idToken: 'google-id-token' })
})
