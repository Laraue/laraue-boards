import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateIssueFormDeps, createIssueFormData } from './CreateIssueForm.deps.impl'

test('sends the new issue as a form and resolves with its key', async () => {
  const { client, requests } = createTestApiClient(() => new Response('ISS-42'))

  assert.equal(
    await createCreateIssueFormDeps(client).create({
      assigneeId: '9',
      attributeValues: [
        { attributeId: '3', type: 'text', value: 'Details' },
        { attributeId: '4', type: 'list', valueId: '11' },
      ],
      content: 'Issue',
      files: [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')],
      statusId: '5',
      title: 'Issue title',
    }),
    'ISS-42',
  )

  const form = await requests[0]!.formData()
  assert.equal(form.get('AssigneeId'), '9')
  assert.equal(form.get('StatusId'), '5')
  assert.equal(form.get('Content'), 'Issue')
  assert.equal(form.get('Title'), 'Issue title')
  assert.deepEqual(JSON.parse(String(form.get('AttributeValues'))), [
    { $type: 'string', attributeId: 3, value: 'Details' },
    { $type: 'enum', attributeId: 4, valueId: 11 },
  ])
  assert.deepEqual(
    form.getAll('Files').map((file) => (file as File).name),
    ['a.txt', 'b.txt'],
  )
})

const input = {
  assigneeId: '00000000-0000-0000-0000-000000000001',
  attributeValues: [{ $type: 'string' as const, attributeId: 1, value: 'value' }],
  content: 'Issue',
  files: [new File(['image'], 'image.png', { type: 'image/png' })],
  removeAttachmentIds: ['00000000-0000-0000-0000-000000000002'],
  title: 'Issue title',
}

test('createIssueFormData preserves multipart fields', () => {
  const createForm = createIssueFormData({ ...input, statusId: '2' })
  assert.equal(createForm.get('Content'), 'Issue')
  assert.equal(createForm.get('Title'), 'Issue title')
  assert.equal(createForm.get('StatusId'), '2')
  assert.equal((createForm.get('Files') as File).name, 'image.png')
  assert.deepEqual(JSON.parse(String(createForm.get('AttributeValues'))), [
    { $type: 'string', attributeId: 1, value: 'value' },
  ])

  assert.isNull(createIssueFormData({ ...input, statusId: '2', title: '  ' }).get('Title'))

})
