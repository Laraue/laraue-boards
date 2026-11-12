import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createJoinOrganizationPageDeps } from './JoinOrganizationPage.deps.impl'

test('asks a signed-out visitor to sign in instead of failing', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.equal(
    await createJoinOrganizationPageDeps(client, () => null).join({ code: 'invite-123' }),
    'sign-in-required',
  )
})

test('exchanges a Google code using the browser language', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  await createJoinOrganizationPageDeps(client, () => null).loginViaGoogle({
    code: 'code',
    languageCode: 'ru-RU',
  })

  assert.deepEqual(await requests[0]!.json(), { code: 'code', languageCode: 'ru' })
})

test('uses init data for invitation sign-in', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  assert.equal(
    await createJoinOrganizationPageDeps(client, () => null, 'init-data').loginViaTelegramMiniApp(),
    true,
  )
  assert.deepEqual(await requests[0]!.json(), { initData: 'init-data' })
})

test('skips the API outside Telegram', async () => {
  const { client, requests } = createTestApiClient()

  assert.equal(
    await createJoinOrganizationPageDeps(client, () => null).loginViaTelegramMiniApp(),
    false,
  )
  assert.equal(requests.length, 0)
})

test('sends the first page and the referring site as they were with every sign-in', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))
  const signUpSourceUrls = {
    landingUrl: 'https://boards.laraue.com/?ref=producthunt',
    referrer: 'https://t.me/',
  }
  const deps = createJoinOrganizationPageDeps(client, () => signUpSourceUrls, 'init-data')

  await deps.loginViaGoogle({ code: 'code' })
  await deps.loginViaTelegramMiniApp()
  await deps.loginViaTelegramWidget({ auth_date: 1, first_name: 'Ada', hash: 'hash', id: 7 })

  const [google, miniApp, widget] = await Promise.all(requests.map((request) => request.json()))
  assert.include(google, {
    signUpLandingUrl: signUpSourceUrls.landingUrl,
    signUpReferrer: signUpSourceUrls.referrer,
  })
  assert.include(miniApp, {
    signUpLandingUrl: signUpSourceUrls.landingUrl,
    signUpReferrer: signUpSourceUrls.referrer,
  })
  assert.include(widget, {
    sign_up_landing_url: signUpSourceUrls.landingUrl,
    sign_up_referrer: signUpSourceUrls.referrer,
  })
})
