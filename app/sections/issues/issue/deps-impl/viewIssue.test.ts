import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewIssue } from './viewIssue'

test('maps issue detail attributes and image attachments', async () => {
  const { client } = createTestApiClient(() => ({
    assignee: 'Ada',
    assigneeColor: '#111',
    assigneeId: '9',
    assigneeInitial: 'A',
    attachments: [
      { id: 'image', originalFileId: 'original', previewFileId: 'preview', type: 0 },
      { id: 'file', originalFileId: 'file', previewFileId: 'file', type: 1 },
    ],
    attributeValues: [
      {
        color: '#222',
        id: 3,
        listValues: [{ id: 4, name: 'High' }],
        name: 'Priority',
        type: 1,
        value: '4',
      },
    ],
    canEdit: true,
    content: null,
    epicId: 7,
    epicName: null,
    key: 'ISS-1',
    ownerColor: '#333',
    ownerDisplayName: null,
    ownerInitials: null,
    spaceId: 2,
    spaceName: 'Product',
    statusId: 5,
    statusName: null,
    time: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  }))

  const result = await createViewIssue(client)({ issueKey: 'ISS-1' })

  assert(result.status === 'success')
  assert.equal(result.data.content, '')
  assert.equal(result.data.owner, 'Unknown owner')
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
})
