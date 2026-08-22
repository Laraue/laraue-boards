type IssueAttribute = {
  id: string
  type: 'date' | 'dateTime' | 'decimal' | 'integer' | 'list' | 'text'
}

export function getIssueAttributeValueInput(
  values: Record<string, string>,
  attributes: IssueAttribute[],
) {
  return attributes.flatMap((attribute) => {
    const value = values[attribute.id]?.trim()
    if (!value) {
      return []
    }
    return [
      attribute.type === 'list'
        ? { attributeId: attribute.id, type: 'list' as const, valueId: value }
        : { attributeId: attribute.id, type: attribute.type, value },
    ]
  })
}
