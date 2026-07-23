import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveIssues } from './moveIssues'

test('rejects moving issues without a selection or a destination', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(await createMoveIssues(client)({ issueKeys: [], statusId: '3' }), {
    code: 400,
    status: 'error',
  })
  assert.deepEqual(await createMoveIssues(client)({ issueKeys: ['ISS-1'], statusId: '' }), {
    code: 400,
    status: 'error',
  })
  assert.equal(requests.length, 0)
})

test('moves every selected issue', async () => {
  const { client, paths } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(
    await createMoveIssues(client)({ issueKeys: ['ISS-1', 'ISS-2'], statusId: '3' }),
    {
      data: true,
      status: 'success',
    },
  )
  assert.deepEqual(paths(), [
    '/api/movement/issue/ISS-1/move-to-status/3',
    '/api/movement/issue/ISS-2/move-to-status/3',
  ])
})

test('reports the status of the first failed move', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(await createMoveIssues(client)({ issueKeys: ['ISS-1'], statusId: '3' }), {
    code: 403,
    status: 'error',
  })
})
