import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createConnectTelegram } from './connectTelegram'

test('sends the Telegram widget data and maps the outcome', async () => {
  const { client, requests } = createTestApiClient(() => ({ outcome: 'Linked' }))
  const user = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  assert.deepEqual(await createConnectTelegram(client)(user), { data: 'linked', status: 'success' })
  assert.deepEqual(await requests[0]!.json(), user)
})
