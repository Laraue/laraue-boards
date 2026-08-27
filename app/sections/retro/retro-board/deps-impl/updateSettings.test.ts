import { assert, test } from 'vitest'

import { createTestRetroApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateSettings } from './updateSettings'

test('updates the phase and vote budget together', async () => {
  const { client, paths, requests } = createTestRetroApiClient()

  await createUpdateSettings(client)({ phase: 'Vote', retroId: '7', votesPerUser: 5 })

  assert.deepEqual(paths(), ['/api/retro/7/settings'])
  assert.deepEqual(await requests[0]?.json(), { phase: 'Vote', votesPerUser: 5 })
})
