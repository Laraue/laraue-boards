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

test('sends the first page and the referring site as they were with every sign-in', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))
  const origin = {
    landingUrl: 'https://boards.laraue.com/?ref=producthunt',
    referrer: 'https://t.me/',
  }
  const deps = createLoginPageDeps(client, 'init-data', () => origin)

  await deps.loginViaGoogle({ code: 'code' })
  await deps.loginViaTelegramMiniApp()
  await deps.loginViaTelegramWidget({ auth_date: 1, first_name: 'Ada', hash: 'hash', id: 7 })

  const [google, miniApp, widget] = await Promise.all(requests.map((request) => request.json()))
  assert.include(google, { signUpLandingUrl: origin.landingUrl, signUpReferrer: origin.referrer })
  assert.include(miniApp, { signUpLandingUrl: origin.landingUrl, signUpReferrer: origin.referrer })
  assert.include(widget, {
    sign_up_landing_url: origin.landingUrl,
    sign_up_referrer: origin.referrer,
  })
})
