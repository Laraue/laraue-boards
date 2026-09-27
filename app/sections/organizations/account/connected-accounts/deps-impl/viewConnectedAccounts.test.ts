import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewConnectedAccounts } from './viewConnectedAccounts'

test('reports both accounts as connected', async () => {
  const { client } = createTestApiClient(() => ({ hasGoogleAccount: true, telegramId: 42 }))

  assert.deepEqual(await createViewConnectedAccounts(client)({}), {
    data: { google: true, telegram: true },
    status: 'success',
  })
})

test('reports Telegram as not connected when the user has no Telegram id', async () => {
  const { client } = createTestApiClient(() => ({ hasGoogleAccount: true, telegramId: null }))

  assert.deepEqual(await createViewConnectedAccounts(client)({}), {
    data: { google: true, telegram: false },
    status: 'success',
  })
})
