import type { components } from '#infrastructure/api/generated'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

type Schemas = components['schemas']
type IssueFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
  | {
      attributeId: string
      from?: string
      to?: string
      type: 'date' | 'dateTime' | 'decimal' | 'integer'
    }
type IssueAttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | {
      attributeId: string
      type: 'date' | 'dateTime' | 'decimal' | 'integer' | 'text'
      value: string
    }

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
      case 'Integer':
        return { ...base, type: 'integer' }
      case 'Decimal':
        return { ...base, type: 'decimal' }
      case 'Date':
        return { ...base, type: 'date' }
      case 'DateTime':
        return { ...base, type: 'dateTime' }
      default:
        throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
    }
  })
}

export const mapIssueFilters = (filters: IssueFilter[]) => {
  return Object.fromEntries(
    filters.map((filter) => {
      switch (filter.type) {
        case 'text':
          return [filter.attributeId, { $type: 'string' as const, searchString: filter.searchString }]
        case 'list':
          return [filter.attributeId, { $type: 'enum' as const, ids: filter.valueIds }]
        case 'date':
          return [filter.attributeId, { $type: 'date' as const, from: filter.from, to: filter.to }]
        case 'dateTime':
          return [
            filter.attributeId,
            { $type: 'datetime' as const, from: filter.from, to: filter.to },
          ]
        case 'decimal':
        case 'integer':
          return [filter.attributeId, { $type: filter.type, min: filter.from, max: filter.to }]
      }
    }),
  ) satisfies Record<string, Schemas['AttributeFilterValue']>
}

export const mapIssueAttributeValues = (values: IssueAttributeValueInput[]) => {
  return values.map((value) => {
    if (value.type === 'list') {
      return { $type: 'enum' as const, attributeId: value.attributeId, valueId: value.valueId }
    }
    return {
      $type:
        value.type === 'text'
          ? ('string' as const)
          : value.type === 'dateTime'
            ? 'datetime'
            : value.type,
      attributeId: value.attributeId,
      value: value.value,
    }
  }) satisfies Schemas['AttributeValue'][]
}

export const mapRawIssueFilters = (
  raw: Record<string, string[]>,
  attributeDtos: Schemas['AttributeDto'][],
) => {
  const attributes = mapIssueAttributes(attributeDtos)
  const filters = getIssueAttributeFilterInput(
    normalizeIssueAttributeFilters(raw, attributes),
    attributes,
  )
  return {
    attributes,
    filters: mapIssueFilters(filters),
  }
}
