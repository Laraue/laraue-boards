import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createIssueCommentsDeps } from './IssueComments.deps.impl'

test('maps the comments of an issue', async () => {
  const { client, paths } = createTestApiClient(() => ({
    data: [
      {
        apiKeyName: null,
        attachments: [
          {
            fileName: 'report.md',
            fileSize: 1200,
            id: 'report',
            mimeType: 'text/markdown',
            originalFileId: 'file',
            previewFileId: null,
            type: 'Document',
          },
        ],
        canModify: true,
        createdAt: '2026-01-03T00:00:00Z',
        id: 8,
        owner: { color: '#444', displayName: 'Ada', initials: 'A' },
        text: 'A comment',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
    hasNextPage: false,
    page: 0,
    perPage: 100,
  }))

  assert.deepEqual(await createIssueCommentsDeps(client).load({ issueKey: 'ISS-1' }), [
    {
      attachments: [
        {
          fileName: 'report.md',
          fileSize: 1200,
          id: 'report',
          kind: 'document',
          url: 'https://api.test/api/files/file',
        },
      ],
      canModify: true,
      createdAt: '2026-01-03T00:00:00Z',
      id: '8',
      owner: { color: '#444', initials: 'A', name: 'Ada' },
      text: 'A comment',
      updatedAt: '2026-01-04T00:00:00Z',
    },
  ])
  assert.deepEqual(paths(), ['/api/issues/ISS-1/comments'])
})
