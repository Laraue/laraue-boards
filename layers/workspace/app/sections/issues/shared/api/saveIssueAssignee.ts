import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

export const saveIssueAssignee = async (
  client: ApiClient,
  { assigneeId, issueKey }: { assigneeId: string; issueKey: string },
) => {
  const issue = await request(
    client.GET('/api/issues/{key}', { params: { path: { key: issueKey } } }),
  )
  const attributeTypes = {
    Date: 'date',
    DateTime: 'datetime',
    Decimal: 'decimal',
    Integer: 'integer',
    List: 'enum',
    Text: 'string',
  } as const
  const form = new FormData()
  form.append('Title', issue.title)
  form.append('Content', issue.content ?? '')
  form.append('AssigneeId', assigneeId)
  form.append(
    'AttributeValues',
    JSON.stringify(
      issue.attributeValues
        .filter((attribute) => attribute.value !== '')
        .map((attribute) => ({
          $type: attributeTypes[attribute.type],
          attributeId: attribute.id,
          ...(attribute.type === 'List'
            ? { valueId: attribute.value }
            : { value: attribute.value }),
        })),
    ),
  )
  await request(
    client.PUT('/api/issues/{key}', {
      body: {},
      bodySerializer: () => form,
      params: { path: { key: issueKey } },
    }),
  )
}
