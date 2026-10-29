import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoginPageDeps } from './LoginPage.deps.impl'

test('sends the Google code with the two-letter browser language', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  await createLoginPageDeps(client).loginViaGoogle({ code: 'google-code', languageCode: 'ru-RU' })

  assert.deepEqual(await requests[0]!.json(), { code: 'google-code', languageCode: 'ru' })
})

test('sends no language when the browser reports none', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  await createLoginPageDeps(client).loginViaGoogle({ code: 'google-code' })

  assert.deepEqual(await requests[0]!.json(), { code: 'google-code', languageCode: null })
})

test('sends Telegram mini app data', async () => {
  const { client, requests } = createTestApiClient(() => new Response('user-token'))

  assert.equal(await createLoginPageDeps(client, 'init-data').loginViaTelegramMiniApp(), true)
  assert.deepEqual(await requests[0]!.json(), { initData: 'init-data' })
})

test('does not call the API outside Telegram', async () => {
  const { client, requests } = createTestApiClient()

  assert.equal(await createLoginPageDeps(client).loginViaTelegramMiniApp(), false)
  assert.equal(requests.length, 0)
})
