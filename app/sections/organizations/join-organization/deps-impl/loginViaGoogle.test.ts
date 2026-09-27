import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoginViaGoogle } from './loginViaGoogle'

test('exchanges a Google code using the browser language', async () => {
  const { client, requests } = createTestApiClient(() => new Response('token'))

  assert.deepEqual(await createLoginViaGoogle(client)({ code: 'code', languageCode: 'ru-RU' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { code: 'code', languageCode: 'ru' })
})
