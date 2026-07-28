import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createDeleteIssue } from './deleteIssue'

test('maps the delete issue response', async () => {
  const { client, paths } = createTestApiClient()

  assert.deepEqual(await createDeleteIssue(client)({ issueKey: 'ISS-1' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/issues/ISS-1'])
})
