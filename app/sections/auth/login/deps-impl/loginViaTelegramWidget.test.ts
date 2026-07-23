import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoginViaTelegramWidget } from './loginViaTelegramWidget'

test('sends Telegram widget user data', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 204 }))
  const user = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  assert.deepEqual(await createLoginViaTelegramWidget(client)(user), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), user)
})
