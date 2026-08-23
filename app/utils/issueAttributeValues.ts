import type { IssueAttributeValueInput } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import { assertNever } from '~/utils/assertNever'

type IssueAttribute =
  | { id: string; type: 'date' }
  | { id: string; type: 'dateTime' }
  | { id: string; type: 'decimal' }
  | { id: string; type: 'integer' }
  | { id: string; type: 'list' }
  | { id: string; type: 'text' }

export function getIssueAttributeValueInput(
  values: Record<string, string>,
  attributes: IssueAttribute[],
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
        return assertNever(attribute)
    }
  })
}
