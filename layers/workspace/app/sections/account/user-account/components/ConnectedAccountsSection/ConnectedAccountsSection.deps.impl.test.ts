import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createConnectedAccountsSectionDeps } from './ConnectedAccountsSection.deps.impl'

test('sends the Google code and maps the outcome', async () => {
  const { client, requests } = createTestApiClient(() => ({ outcome: 'OwnerHasData' }))

  assert.equal(
    await createConnectedAccountsSectionDeps(client).connectGoogle({ code: 'google-code' }),
    'owner-has-data',
  )
  assert.deepEqual(await requests[0]!.json(), { code: 'google-code' })
})

test('reports Telegram as not connected when the user has no Telegram id', async () => {
  const { client } = createTestApiClient(() => ({ hasGoogleAccount: true, telegramId: null }))

  assert.deepEqual(await createConnectedAccountsSectionDeps(client).view({}), {
    google: true,
    telegram: false,
  })
})
