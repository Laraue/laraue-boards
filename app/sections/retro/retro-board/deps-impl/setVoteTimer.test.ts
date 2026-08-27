import { assert, test } from 'vitest'

import { createTestRetroApiClient } from '#infrastructure/api/testApiClient'

import { createSetVoteTimer } from './setVoteTimer'

test('starts and stops the vote timer without changing settings', async () => {
  const { client, paths, requests } = createTestRetroApiClient()

  await createSetVoteTimer(client)({ minutes: 3, retroId: '7' })
  await createSetVoteTimer(client)({ minutes: null, retroId: '7' })

  assert.deepEqual(paths(), ['/api/retro/7/timer', '/api/retro/7/timer'])
  assert.deepEqual(await Promise.all(requests.map((request) => request.json())), [
    { minutes: 3 },
    { minutes: null },
  ])
})
