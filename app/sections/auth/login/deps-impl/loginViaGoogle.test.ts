import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoginViaGoogle } from './loginViaGoogle'

test('sends the Google ID token with the two-letter browser language', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  assert.deepEqual(
    await createLoginViaGoogle(client)({ idToken: 'google-id-token', languageCode: 'ru-RU' }),
    {
      data: true,
      status: 'success',
    },
  )
  assert.deepEqual(await requests[0]!.json(), { idToken: 'google-id-token', languageCode: 'ru' })
})

test('sends no language when the browser reports none', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  await createLoginViaGoogle(client)({ idToken: 'google-id-token' })

  assert.deepEqual(await requests[0]!.json(), { idToken: 'google-id-token', languageCode: null })
})
