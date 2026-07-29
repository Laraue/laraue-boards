import type { components } from '#infrastructure/api/generated'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

type Schemas = components['schemas']
type IssueFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
type IssueAttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export const mapIssueAttributes = (
  attributes: Schemas['AttributeDto'][],
): IssueAttributeField[] => {
  return attributes.map((attribute) => {
    if (attribute.id === undefined) {
      throw new TypeError('Attribute id is required')
    }
    const base = {
      color: attribute.color,
      id: String(attribute.id),
      name: attribute.name,
    }
    switch (attribute.type) {
      case 'Text':
        return { ...base, type: 'text' }
      case 'List':
        return {
          ...base,
          options: attribute.listValues.map((option) => {
            if (option.id === undefined) {
              throw new TypeError('Attribute option id is required')
            }
            return { label: option.name, value: String(option.id) }
          }),
          type: 'list',
        }
      default:
        throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
    }
  })
}

export const mapIssueFilters = (filters: IssueFilter[]) => {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.attributeId,
      filter.type === 'text'
        ? { $type: 'string' as const, searchString: filter.searchString }
        : { $type: 'enum' as const, ids: filter.valueIds },
    ]),
  ) satisfies Record<string, Schemas['AttributeFilterValue']>
}

export const mapIssueAttributeValues = (values: IssueAttributeValueInput[]) => {
  return values.map((value) =>
    value.type === 'text'
      ? {
          $type: 'string' as const,
          attributeId: value.attributeId,
          value: value.value,
        }
      : {
          $type: 'enum' as const,
          attributeId: value.attributeId,
          valueId: value.valueId,
        },
  ) satisfies Schemas['AttributeValue'][]
}

export const mapRawIssueFilters = (
  raw: Record<string, string[]>,
  attributeDtos: Schemas['AttributeDto'][],
) => {
  const attributes = mapIssueAttributes(attributeDtos)
  const filters: IssueFilter[] = []
  for (const attribute of attributes) {
    const values = raw[attribute.id] ?? []
    if (attribute.type === 'text') {
      const searchString = values.at(-1)
      if (searchString) {
        filters.push({ attributeId: attribute.id, searchString, type: 'text' })
      }
      continue
    }
    const allowed = new Set(attribute.options.map((option) => option.value))
    const valueIds = [...new Set(values.filter((value) => allowed.has(value)))]
    if (valueIds.length) {
      filters.push({ attributeId: attribute.id, type: 'list', valueIds })
    }
  }
  return {
    attributes,
    filters: mapIssueFilters(filters),
  }
}
