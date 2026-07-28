import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoardIssue } from './moveBoardIssue'

test('rejects an empty destination and moves to a selected status', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))
  const moveIssue = createMoveBoardIssue(client)

  assert.deepEqual(await moveIssue({ issueKey: 'ISS-1', statusId: '', updateStatus: true }), {
    message: 'This issue cannot be moved to that column.',
    status: 'validation-error',
  })
  assert.deepEqual(await moveIssue({ issueKey: 'ISS-1', statusId: '3', updateStatus: true }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/issues/status'])
  assert.deepEqual(await requests[0]!.json(), { issueKeys: ['ISS-1'], statusId: 3 })
})

test('orders an issue inside its column without touching the status', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(
    await createMoveBoardIssue(client)({
      issueKey: 'ISS-1',
      statusId: '3',
      target: { issueKey: 'ISS-2', position: 'Before' },
      updateStatus: false,
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), ['/api/issues/order'])
  assert.deepEqual(await requests[0]!.json(), {
    issueKeys: ['ISS-1'],
    targetKey: 'ISS-2',
    targetType: 'Before',
  })
})

test('changes the status and then the order when dropped into another column', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(
    await createMoveBoardIssue(client)({
      issueKey: 'ISS-1',
      statusId: '3',
      target: { issueKey: 'ISS-2', position: 'After' },
      updateStatus: true,
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), ['/api/issues/status', '/api/issues/order'])
  assert.deepEqual(await requests[1]!.json(), {
    issueKeys: ['ISS-1'],
    targetKey: 'ISS-2',
    targetType: 'After',
  })
})

test('skips the order request when the status request fails', async () => {
  const { client, paths } = createTestApiClient(() => new Response(null, { status: 500 }))

  assert.deepEqual(
    await createMoveBoardIssue(client)({
      issueKey: 'ISS-1',
      statusId: '3',
      target: { issueKey: 'ISS-2', position: 'After' },
      updateStatus: true,
    }),
    { code: 500, status: 'error' },
  )
  assert.deepEqual(paths(), ['/api/issues/status'])
})
