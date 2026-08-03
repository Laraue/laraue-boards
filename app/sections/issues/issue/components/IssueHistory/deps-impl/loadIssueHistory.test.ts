import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadIssueHistory } from './loadIssueHistory'

test('maps issue history and sends pagination', async () => {
  const { client, paths, requests } = createTestApiClient(() => ({
    data: [
      {
        action: 'Update',
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
            newValueColor: null,
            newValueName: null,
            oldValueColor: '#444',
            oldValueName: 'High',
            propertyName: 'Priority',
          },
          { $type: 'attachment', fileId: '1', fileName: 'new.txt' },
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
            label: 'Description',
          },
          {
            kind: 'assignee',
            label: 'Assignee',
            newColor: '#111',
            newValue: 'Ada',
            oldColor: null,
            oldValue: 'None',
          },
          {
            label: 'Status',
            newColor: '#222',
            newValue: 'None',
            oldColor: '#333',
            oldValue: 'To do',
          },
          {
            label: 'Priority',
            newColor: null,
            newValue: 'None',
            oldColor: '#444',
            oldValue: 'High',
          },
          { label: 'Updated attachment', newValue: 'new.txt' },
          {
            kind: 'board',
            label: 'Board',
            newColor: '#555',
            newValue: 'Roadmap',
            oldColor: null,
            oldValue: 'None',
          },
          {
            kind: 'space',
            label: 'Space',
            newColor: '#666',
            newValue: 'Product',
            oldColor: '#777',
            oldValue: 'Inbox',
          },
        ],
        createdAt: '2026-01-03T00:00:00Z',
        owner: { color: '#444', initials: 'A', name: 'Ada Lovelace' },
      },
      {
        changes: [{ label: 'Comment created' }],
        createdAt: '2026-01-02T00:00:00Z',
        owner: { color: '#888', initials: 'G', name: 'Grace Hopper' },
      },
    ],
  })
  assert.deepEqual(paths(), ['/api/issues/ISS-1/history'])
  assert.equal(requests[0]!.method, 'POST')
  assert.deepEqual(await requests[0]!.json(), { pagination: { page: 2, perPage: 20 } })
})
