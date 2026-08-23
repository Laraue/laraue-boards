import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { toLocalIssueDateTime } from '~/sections/issues/shared/api/issueDateTime'

import { createViewIssue } from './viewIssue'

test('maps issue detail and comments', async () => {
  const comment = {
    canModify: true,
    createdAt: '2026-01-03T00:00:00Z',
    id: 8,
    owner: { color: '#444', displayName: 'Ada', initials: 'A' },
    text: 'A comment',
    updatedAt: '2026-01-04T00:00:00Z',
  }
  const { client, paths } = createTestApiClient((_request, path) =>
    path.endsWith('/comments')
      ? { data: [comment], hasNextPage: false, page: 0, perPage: 100 }
      : {
          assignee: {
            color: '#111',
            displayName: 'Ada',
            initials: 'A',
            isCurrentUser: true,
          },
          assigneeId: '9',
          attachments: [
            {
              fileName: 'image.png',
              id: 'image',
              originalFileId: 'original',
              previewFileId: 'preview',
              type: 'Image',
            },
            {
              fileName: 'video.mp4',
              id: 'file',
              originalFileId: 'file',
              previewFileId: 'file',
              type: 'Video',
            },
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
            {
              color: '#555',
              id: 6,
              listValues: [],
              name: 'Starts',
              type: 'DateTime',
              value: '2026-08-22T12:30:00Z',
            },
            {
              color: '#666',
              id: 7,
              listValues: [],
              name: 'Estimate',
              type: 'Decimal',
              value: 1,
            },
            {
              color: '#777',
              id: 8,
              listValues: [],
              name: 'Points',
              type: 'Integer',
              value: 2,
            },
          ],
          canEdit: true,
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
        },
  )

  const result = await createViewIssue(client)({ issueKey: 'ISS-1' })

  assert(result.status === 'success')
  assert.equal(result.data.content, '')
  assert.equal(result.data.assigneeIsCurrentUser, true)
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
    {
      color: '#555',
      id: '6',
      name: 'Starts',
      type: 'dateTime',
      value: toLocalIssueDateTime('2026-08-22T12:30:00Z'),
    },
    {
      color: '#666',
      id: '7',
      name: 'Estimate',
      type: 'decimal',
      value: '1',
    },
    {
      color: '#777',
      id: '8',
      name: 'Points',
      type: 'integer',
      value: '2',
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
  assert.deepEqual(paths(), ['/api/issues/ISS-1', '/api/issues/ISS-1/comments'])
})
