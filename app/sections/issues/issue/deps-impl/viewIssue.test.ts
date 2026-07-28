import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewIssue } from './viewIssue'

test('maps issue detail attributes and image attachments', async () => {
  const { client } = createTestApiClient(() => ({
    assignee: { color: '#111', displayName: 'Ada', initials: 'A' },
    assigneeId: '9',
    attachments: [
      { id: 'image', originalFileId: 'original', previewFileId: 'preview', type: 'Image' },
      { id: 'file', originalFileId: 'file', previewFileId: 'file', type: 'Video' },
    ],
    attributeValues: [
      {
        color: '#222',
        id: 3,
        listValues: [{ id: 4, name: 'High' }],
        name: 'Priority',
        type: 'List',
        value: '4',
      },
    ],
    canEdit: true,
    comments: [
      {
        canModify: true,
        createdAt: '2026-01-03T00:00:00Z',
        id: 8,
        owner: { color: '#444', displayName: 'Ada', initials: 'A' },
        text: 'A comment',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
    content: null,
    epicId: 7,
    epicName: null,
    key: 'ISS-1',
    owner: { color: '#333', displayName: 'Grace', initials: 'G' },
    spaceKey: 'product',
    spaceName: 'Product',
    statusId: 5,
    statusName: null,
    time: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  }))

  const result = await createViewIssue(client)({ issueKey: 'ISS-1' })

  assert(result.status === 'success')
  assert.equal(result.data.content, '')
  assert.equal(result.data.owner, 'Grace')
  assert.deepEqual(result.data.attributes, [
    {
      color: '#222',
      id: '3',
      name: 'Priority',
      options: [{ label: 'High', value: '4' }],
      type: 'list',
      value: '4',
    },
  ])
  assert.deepEqual(result.data.attachments, [
    {
      id: 'image',
      originalUrl: 'https://api.test/api/files/original',
      previewUrl: 'https://api.test/api/files/preview',
    },
  ])
  assert.deepEqual(result.data.comments, [
    {
      canModify: true,
      createdAt: '2026-01-03T00:00:00Z',
      id: '8',
      owner: { color: '#444', initials: 'A', name: 'Ada' },
      text: 'A comment',
      updatedAt: '2026-01-04T00:00:00Z',
    },
  ])
})
