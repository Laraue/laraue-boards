import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadIssueHistory } from './loadIssueHistory'

test('maps issue history and sends pagination', async () => {
  const { client, paths, requests } = createTestApiClient(() => ({
    data: [
      {
        changes: [
          { $type: 'content', newContent: 'new', oldContent: 'old' },
          {
            $type: 'assignee',
            newAssigneeDisplayName: 'Ada',
            newAssigneeId: '2',
            oldAssigneeDisplayName: null,
            oldAssigneeId: null,
          },
          {
            $type: 'status',
            newStatusId: 3,
            newStatusName: null,
            oldStatusId: 2,
            oldStatusName: 'To do',
          },
          {
            $type: 'property',
            newValueId: null,
            newValueName: null,
            oldValueId: 1,
            oldValueName: 'High',
            propertyName: 'Priority',
          },
          { $type: 'attachment', changeAction: 'Create', fileId: '1', fileName: 'new.txt' },
          { $type: 'attachment', changeAction: 'Delete', fileId: '2', fileName: 'old.txt' },
          { $type: 'attachment', changeAction: 'Update', fileId: '3', fileName: null },
          { $type: 'issue', changeAction: 'Create' },
          { $type: 'issue', changeAction: 'Update' },
          { $type: 'issue', changeAction: 'Delete' },
          {},
        ],
        createdAt: '2026-01-03T00:00:00Z',
        owner: { color: '#444', displayName: 'Ada Lovelace', initials: 'A' },
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
            label: 'Description changed',
          },
          { label: 'Assignee changed', newValue: 'Ada', oldValue: 'None' },
          { label: 'Status changed', newValue: '3', oldValue: 'To do' },
          { label: 'Priority changed', newValue: 'None', oldValue: 'High' },
          { label: 'Added attachment', newValue: 'new.txt' },
          { label: 'Removed attachment', newValue: 'old.txt' },
          { label: 'Updated attachment', newValue: 'Untitled file' },
          { label: 'Issue created' },
          { label: 'Issue updated' },
          { label: 'Issue deleted' },
          { label: 'Issue updated' },
        ],
        createdAt: '2026-01-03T00:00:00Z',
        owner: { color: '#444', initials: 'A', name: 'Ada Lovelace' },
      },
    ],
  })
  assert.deepEqual(paths(), ['/api/issues/ISS-1/history'])
  assert.equal(requests[0]!.method, 'POST')
  assert.deepEqual(await requests[0]!.json(), { pagination: { page: 2, perPage: 20 } })
})
