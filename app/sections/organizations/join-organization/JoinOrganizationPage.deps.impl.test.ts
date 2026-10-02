import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createJoinOrganizationPageDeps } from './JoinOrganizationPage.deps.impl'

test('asks a signed-out visitor to sign in instead of failing', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.equal(
    await createJoinOrganizationPageDeps(client).join({ code: 'invite-123' }),
    'sign-in-required',
  )
})

test('exchanges a Google code using the browser language', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  await createJoinOrganizationPageDeps(client).loginViaGoogle({
    code: 'code',
    languageCode: 'ru-RU',
  })

  assert.deepEqual(await requests[0]!.json(), { code: 'code', languageCode: 'ru' })
})

test('uses init data for invitation sign-in', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  assert.equal(
    await createJoinOrganizationPageDeps(client, 'init-data').loginViaTelegramMiniApp(),
    true,
  )
  assert.deepEqual(await requests[0]!.json(), { initData: 'init-data' })
})

test('skips the API outside Telegram', async () => {
  const { client, requests } = createTestApiClient()

  assert.equal(await createJoinOrganizationPageDeps(client).loginViaTelegramMiniApp(), false)
  assert.equal(requests.length, 0)
})
