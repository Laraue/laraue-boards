import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoginViaTelegramMiniApp } from './loginViaTelegramMiniApp'

test('sends Telegram mini app data', async () => {
  const { client, requests } = createTestApiClient(() => new Response('user-token'))

  assert.deepEqual(await createLoginViaTelegramMiniApp(client, 'init-data')(), {
    data: { authenticated: true },
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { initData: 'init-data' })
})

test('does not call the API outside Telegram', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(await createLoginViaTelegramMiniApp(client)(), {
    data: { authenticated: false },
    status: 'success',
  })
  assert.equal(requests.length, 0)
})
