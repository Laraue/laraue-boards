import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadIssueHistory } from './loadIssueHistory'

test('maps issue history and sends pagination', async () => {
  const { client, paths, requests } = createTestApiClient(() => ({
    data: [
      {
        action: 'Update',
        apiKeyName: 'Claude',
        changes: [
          { $type: 'content', newContent: 'new', oldContent: 'old' },
          {
            $type: 'assignee',
            newAssigneeColor: '#111',
            newAssigneeDisplayName: 'Ada',
            oldAssigneeColor: null,
            oldAssigneeDisplayName: null,
          },
          {
            $type: 'status',
            newStatusColor: '#222',
            newStatusName: null,
            oldStatusColor: '#333',
            oldStatusName: 'To do',
          },
          {
            $type: 'property',
            attributeType: 'List',
            newValueColor: null,
            newValueName: null,
            oldValueColor: '#444',
            oldValueName: 'High',
            propertyName: 'Priority',
          },
          {
            $type: 'property',
            attributeType: 'DateTime',
            newValueColor: null,
            newValueName: '2026-08-11T09:00:00.0000000Z',
            oldValueColor: null,
            oldValueName: '2026-08-04T11:00:00.0000000Z',
            propertyName: 'Date and time',
          },
          {
            $type: 'attachment',
            action: 'Created',
            fileName: 'new.txt',
            previewFileId: '1',
          },
          {
            $type: 'attachment',
            action: 'Deleted',
            fileName: 'old.txt',
            previewFileId: null,
          },
          {
            $type: 'epic',
            newEpicColor: '#555',
            newEpicName: 'Roadmap',
            oldEpicColor: null,
            oldEpicName: null,
          },
          {
            $type: 'space',
            newSpaceColor: '#666',
            newSpaceName: 'Product',
            oldSpaceColor: '#777',
            oldSpaceName: 'Inbox',
          },
        ],
        createdAt: '2026-01-03T00:00:00Z',
        entityType: 'Issue',
        owner: { color: '#444', displayName: 'Ada Lovelace', initials: 'A' },
      },
      {
        action: 'Create',
        changes: [],
        createdAt: '2026-01-02T00:00:00Z',
        entityType: 'Comment',
        owner: { color: '#888', displayName: 'Grace Hopper', initials: 'G' },
      },
    ],
    hasNextPage: true,
    page: 2,
    perPage: 20,
  }))

  const result = await createLoadIssueHistory(client)({ issueKey: 'ISS-1', page: 2 })

  if (result.status !== 'success') {
    assert.fail('Expected issue history to load')
  }

  assert.deepEqual(result.data, {
    hasNextPage: true,
    items: [
      {
        changes: [
          {
            commentAction: null,
            diff: [
              {
                kind: 'removed',
                oldLine: 1,
                spans: [{ changed: true, text: 'old' }],
                text: 'old',
              },
              {
                kind: 'added',
                newLine: 1,
                spans: [{ changed: true, text: 'new' }],
                text: 'new',
              },
            ],
            kind: 'description',
          },
          {
            kind: 'assignee',
            newColor: '#111',
            newValue: 'Ada',
            oldColor: null,
            oldValue: null,
          },
          {
            kind: 'status',
            newColor: '#222',
            newValue: null,
            oldColor: '#333',
            oldValue: 'To do',
          },
          {
            format: null,
            kind: 'property',
            label: 'Priority',
            newColor: null,
            newValue: null,
            oldColor: '#444',
            oldValue: 'High',
          },
          {
            format: 'dateTime',
            kind: 'property',
            label: 'Date and time',
            newColor: null,
            newValue: '2026-08-11T09:00:00.0000000Z',
            oldColor: null,
            oldValue: '2026-08-04T11:00:00.0000000Z',
          },
          {
            action: 'added',
            fileName: 'new.txt',
            imageUrl: 'https://api.test/api/files/1',
            kind: 'attachment',
          },
          {
            action: 'removed',
            fileName: 'old.txt',
            imageUrl: null,
            kind: 'attachment',
          },
          {
            kind: 'board',
            newColor: '#555',
            newValue: 'Roadmap',
            oldColor: null,
            oldValue: null,
          },
          {
            kind: 'space',
            newColor: '#666',
            newValue: 'Product',
            oldColor: '#777',
            oldValue: 'Inbox',
          },
        ],
        createdAt: '2026-01-03T00:00:00Z',
        owner: { apiKeyName: 'Claude', color: '#444', initials: 'A', name: 'Ada Lovelace' },
      },
      {
        changes: [{ action: 'Create', entityType: 'Comment', kind: 'event' }],
        createdAt: '2026-01-02T00:00:00Z',
        owner: { color: '#888', initials: 'G', name: 'Grace Hopper' },
      },
    ],
  })
  assert.deepEqual(paths(), ['/api/issues/ISS-1/history'])
  assert.equal(requests[0]!.method, 'POST')
  assert.deepEqual(await requests[0]!.json(), { pagination: { page: 2, perPage: 20 } })
})
