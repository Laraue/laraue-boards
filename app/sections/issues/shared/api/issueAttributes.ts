import type { components } from '#infrastructure/api/generated'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import { assertNever } from '~/utils/assertNever'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

import { toUtcIssueDateTime } from './issueDateTime'

type Schemas = components['schemas']
export type IssueAttributeDto = Schemas['AttributeDto']
type IssueFilter =
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
type IssueAttributeValueInput =
  | { attributeId: string; type: 'date'; value: string }
  | { attributeId: string; type: 'dateTime'; value: string }
  | { attributeId: string; type: 'decimal'; value: string }
  | { attributeId: string; type: 'integer'; value: string }
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export const mapIssueAttributes = (attributes: IssueAttributeDto[]): IssueAttributeField[] => {
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
        return assertNever(attribute.type)
    }
  })
}

export const mapIssueFilters = (filters: IssueFilter[]) => {
  return Object.fromEntries(
    filters.map((filter) => {
      switch (filter.type) {
        case 'text':
          return [
            filter.attributeId,
            { $type: 'string' as const, searchString: filter.searchString },
          ]
        case 'list':
          return [filter.attributeId, { $type: 'enum' as const, ids: filter.valueIds }]
        case 'date':
          return [filter.attributeId, { $type: 'date' as const, from: filter.from, to: filter.to }]
        case 'dateTime':
          return [
            filter.attributeId,
            {
              $type: 'datetime' as const,
              from: filter.from && toUtcIssueDateTime(filter.from),
              to: filter.to && toUtcIssueDateTime(filter.to),
            },
          ]
        case 'decimal':
          return [
            filter.attributeId,
            { $type: 'decimal' as const, max: filter.to, min: filter.from },
          ]
        case 'integer':
          return [
            filter.attributeId,
            { $type: 'integer' as const, max: filter.to, min: filter.from },
          ]
        default:
          return assertNever(filter)
      }
    }),
  ) satisfies Record<string, Schemas['AttributeFilterValue']>
}

export const mapIssueAttributeValues = (values: IssueAttributeValueInput[]) => {
  return values.map((value) => {
    switch (value.type) {
      case 'text':
        return { $type: 'string' as const, attributeId: value.attributeId, value: value.value }
      case 'list':
        return { $type: 'enum' as const, attributeId: value.attributeId, valueId: value.valueId }
      case 'integer':
        return { $type: 'integer' as const, attributeId: value.attributeId, value: value.value }
      case 'decimal':
        return { $type: 'decimal' as const, attributeId: value.attributeId, value: value.value }
      case 'date':
        return { $type: 'date' as const, attributeId: value.attributeId, value: value.value }
      case 'dateTime':
        return {
          $type: 'datetime' as const,
          attributeId: value.attributeId,
          value: toUtcIssueDateTime(value.value),
        }
      default:
        return assertNever(value)
    }
  }) satisfies Schemas['AttributeValue'][]
}

export const mapRawIssueFilters = (
  raw: Record<string, string[]>,
  attributeDtos: IssueAttributeDto[],
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
