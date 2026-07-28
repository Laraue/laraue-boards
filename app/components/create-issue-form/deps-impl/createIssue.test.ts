import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateIssue } from './createIssue'

test('maps the create issue request and response', async () => {
  const { client, requests } = createTestApiClient(() => new Response('ISS-42'))

  assert.deepEqual(
    await createCreateIssue(client)({
      assigneeId: '9',
      attributeValues: [
        { attributeId: '3', type: 'text', value: 'Details' },
        { attributeId: '4', type: 'list', valueId: '11' },
      ],
      content: 'Issue',
      files: [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')],
      statusId: '5',
    }),
    { data: { issueKey: 'ISS-42' }, status: 'success' },
  )

  const form = await requests[0]!.formData()
  assert.equal(form.get('AssigneeId'), '9')
  assert.equal(form.get('StatusId'), '5')
  assert.equal(form.get('Content'), 'Issue')
  assert.deepEqual(JSON.parse(String(form.get('AttributeValues'))), [
    { $type: 'string', attributeId: '3', value: 'Details' },
    { $type: 'enum', attributeId: '4', valueId: '11' },
  ])
  assert.deepEqual(
    form.getAll('Files').map((file) => (file as File).name),
    ['a.txt', 'b.txt'],
  )
})
