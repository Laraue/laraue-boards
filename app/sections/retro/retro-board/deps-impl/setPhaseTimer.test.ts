import { assert, test } from 'vitest'

import { createTestRetroApiClient } from '#infrastructure/api/testApiClient'

import { createSetPhaseTimer } from './setPhaseTimer'

test('starts and stops the phase timer without changing settings', async () => {
  const { client, paths, requests } = createTestRetroApiClient()

  await createSetPhaseTimer(client)({ minutes: 3, retroId: '7' })
  await createSetPhaseTimer(client)({ minutes: null, retroId: '7' })

  assert.deepEqual(paths(), ['/api/retro/7/timer', '/api/retro/7/timer'])
  assert.deepEqual(await Promise.all(requests.map((request) => request.json())), [
    { minutes: 3 },
    { minutes: null },
  ])
})
