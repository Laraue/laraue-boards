import type {
  IssueAttributeField,
  IssueAttributeValueInput,
} from '#layers/workspace/app/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

export function getIssueAttributeValueInput(
  values: Record<string, string>,
  attributes: Pick<IssueAttributeField, 'id' | 'type'>[],
): IssueAttributeValueInput[] {
  return attributes.flatMap<IssueAttributeValueInput>((attribute) => {
    const value = values[attribute.id]?.trim()
    if (!value) {
      return []
    }
    switch (attribute.type) {
      case 'text':
        return [{ attributeId: attribute.id, type: 'text' as const, value }]
      case 'list':
        return [{ attributeId: attribute.id, type: 'list' as const, valueId: value }]
      case 'integer':
        return [{ attributeId: attribute.id, type: 'integer' as const, value }]
      case 'decimal':
        return [{ attributeId: attribute.id, type: 'decimal' as const, value }]
      case 'date':
        return [{ attributeId: attribute.id, type: 'date' as const, value }]
      case 'dateTime':
        return [{ attributeId: attribute.id, type: 'dateTime' as const, value }]
      default:
        return assertNever(attribute.type)
    }
  })
}
