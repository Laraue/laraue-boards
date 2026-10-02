import { expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateBoardIssuePageDeps } from './CreateBoardIssuePage.deps.impl'

test('fails with 403 when the user cannot create issues on the board', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/epics/7' ? { canCreateIssues: false, name: 'Roadmap' } : [],
  )

  await expect(createCreateBoardIssuePageDeps(client).view({ boardId: '7' })).rejects.toMatchObject(
    { status: 403 },
  )
})
