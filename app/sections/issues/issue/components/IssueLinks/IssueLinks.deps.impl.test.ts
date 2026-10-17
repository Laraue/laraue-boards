import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createIssueLinksDeps } from './IssueLinks.deps.impl'

test('adds a link with the API relation name', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))

  const result = await createIssueLinksDeps(client).add({
    issueKey: 'ISS-1',
    otherIssueKey: 'ISS-2',
    relation: 'blockedBy',
  })

  assert.deepEqual(result, { outcome: 'added' })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/issues/ISS-1/links')
  assert.deepEqual(await requests[0]!.json(), { otherIssueKey: 'ISS-2', relation: 'BlockedBy' })
})

test('reports an issue that is not found or not visible', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 404 }))

  const result = await createIssueLinksDeps(client).add({
    issueKey: 'ISS-1',
    otherIssueKey: 'ISS-404',
    relation: 'relatesTo',
  })

  assert.deepEqual(result, { outcome: 'notFound' })
})
