import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createIssueListDeps } from './IssueList.deps.impl'

test('changing the assignee preserves the latest issue text and attributes', async () => {
  const { client, requests } = createTestApiClient((request) =>
    request.method === 'GET'
      ? {
          attributeValues: [
            { id: 1, type: 'Text', value: 'Keep this' },
            { id: 2, type: 'List', value: '7' },
            { id: 3, type: 'Integer', value: '0' },
            { id: 4, type: 'Date', value: '' },
          ],
          content: 'Current description',
          title: 'Current title',
        }
      : {},
  )

  await createIssueListDeps(client).quickEdit!.saveAssignee({
    assigneeId: 'new-assignee',
    issueKey: 'ISS-1',
  })

  assert.equal(requests[0]!.method, 'GET')
  assert.equal(requests[1]!.method, 'PUT')
  const form = await requests[1]!.formData()
  assert.equal(form.get('Title'), 'Current title')
  assert.equal(form.get('Content'), 'Current description')
  assert.equal(form.get('AssigneeId'), 'new-assignee')
  assert.deepEqual(JSON.parse(String(form.get('AttributeValues'))), [
    { $type: 'string', attributeId: 1, value: 'Keep this' },
    { $type: 'enum', attributeId: 2, valueId: '7' },
    { $type: 'integer', attributeId: 3, value: '0' },
  ])
})
