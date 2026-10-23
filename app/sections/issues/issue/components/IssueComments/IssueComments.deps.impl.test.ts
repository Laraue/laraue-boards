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

test('sends the files of a new comment', async () => {
  const { client, requests } = createTestApiClient(() => 1)
  const report = new File(['# Report'], 'report.md', { type: 'text/markdown' })

  await createIssueCommentsDeps(client).create({
    files: [report],
    issueKey: 'ISS-1',
    text: 'See the report',
  })

  const form = await requests[0]!.formData()
  assert.equal(form.get('IssueKey'), 'ISS-1')
  assert.equal(form.get('Text'), 'See the report')
  assert.deepEqual(
    form.getAll('Files').map((file) => (file as File).name),
    ['report.md'],
  )
})

test('sends the added and removed attachments of an edited comment', async () => {
  const { client, paths, requests } = createTestApiClient()
  const config = new File(['{}'], 'config.json', { type: 'application/json' })

  await createIssueCommentsDeps(client).update({
    files: [config],
    id: '8',
    removeAttachmentIds: ['old', 'older'],
    text: 'Updated',
  })

  const form = await requests[0]!.formData()
  assert.equal(form.get('Text'), 'Updated')
  assert.deepEqual(
    form.getAll('AddFiles').map((file) => (file as File).name),
    ['config.json'],
  )
  assert.deepEqual(form.getAll('RemoveAttachmentIds'), ['old', 'older'])
  assert.deepEqual(paths(), ['/api/issues/comments/8'])
})
