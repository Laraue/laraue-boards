import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateBacklogIssuePageDeps } from './CreateBacklogIssuePage.deps.impl'

const createClient = (canCreateIssues: boolean) =>
  createTestApiClient((_request, path) => {
    if (path === '/api/spaces') {
      return [{ isDefault: false, key: 'product-ABCD', name: 'Product' }]
    }
    if (path === '/api/spaces/product-ABCD/epics') {
      return [{ id: 8, isDefault: true, name: 'Backlog' }]
    }
    if (path === '/api/epics/8') {
      return { canCreateIssues }
    }
    return []
  }).client

test('maps backlog issue page data', async () => {
  const deps = createCreateBacklogIssuePageDeps(createClient(true))

  assert.deepEqual(await deps.view({ spaceKey: 'product-ABCD' }), {
    attributes: [],
    boardId: '8',
    boardName: 'Backlog',
    spaceName: 'Product',
  })
})

test('fails with 403 when the backlog does not accept new issues', async () => {
  const deps = createCreateBacklogIssuePageDeps(createClient(false))

  await expect(deps.view({ spaceKey: 'product-ABCD' })).rejects.toMatchObject({ status: 403 })
})
