import type { mapIssueAttributeValues } from './issueAttributes'

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

export const updateIssueFormData = (input: {
  assigneeId: string
  attributeValues: AttributeValue[]
  content: string
  files: File[]
  removeAttachmentIds: string[]
  title: string
}) => {
  const formData = new FormData()
  appendIssueFields(formData, input)
  input.files.forEach((file) => formData.append('AddFiles', file))
  input.removeAttachmentIds.forEach((id) => formData.append('RemoveAttachmentIds', id))
  return formData
}
