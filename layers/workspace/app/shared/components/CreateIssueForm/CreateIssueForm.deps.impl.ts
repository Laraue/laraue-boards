import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createAssigneeSelectDeps } from '#layers/workspace/app/shared/components/AssigneeSelect/AssigneeSelect.deps.impl'
import { createBoardSelectDeps } from '#layers/workspace/app/shared/components/BoardSelect/BoardSelect.deps.impl'
import { mapIssueAttributeValues } from '#layers/workspace/app/shared/components/IssueAttributeFields/IssueAttributeFields.deps.impl'
import { createIssueDescriptionDeps } from '#layers/workspace/app/shared/components/IssueDescription/IssueDescription.deps.impl'
import { createSpaceSelectDeps } from '#layers/workspace/app/shared/components/SpaceSelect/SpaceSelect.deps.impl'
import { createStatusSelectDeps } from '#layers/workspace/app/shared/components/StatusSelect/StatusSelect.deps.impl'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'

export const createCreateIssueFormDeps = (client: ApiClient): CreateIssueFormDeps => ({
  assigneeSelect: createAssigneeSelectDeps(client),
  boardSelect: createBoardSelectDeps(client),

  // Sent as a form, so the attached files go with it.
  create: (input) =>
    request(
      client.POST('/api/issues', {
        body: {},
        bodySerializer: () =>
          createIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        parseAs: 'text',
      }),
    ),

  description: createIssueDescriptionDeps(client),
  spaceSelect: createSpaceSelectDeps(client),
  statusSelect: createStatusSelectDeps(client),
})

type AttributeValue = ReturnType<typeof mapIssueAttributeValues>[number]

const appendIssueFields = (
  formData: FormData,
  input: {
    assigneeId: string
    attributeValues: AttributeValue[]
    content: string
    title: string
  },
) => {
  formData.append('AssigneeId', input.assigneeId)
  formData.append('AttributeValues', JSON.stringify(input.attributeValues))
  formData.append('Content', input.content)
  // No title asks the server to generate one.
  if (input.title.trim()) {
    formData.append('Title', input.title)
  }
}

export const createIssueFormData = (input: {
  assigneeId: string
  attributeValues: AttributeValue[]
  content: string
  files: File[]
  statusId: string
  title: string
}) => {
  const formData = new FormData()
  appendIssueFields(formData, input)
  formData.append('StatusId', input.statusId)
  input.files.forEach((file) => formData.append('Files', file))
  return formData
}
