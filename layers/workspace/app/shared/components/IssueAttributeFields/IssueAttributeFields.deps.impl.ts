import type { components } from '#infrastructure/api/generated'
import { toUtcIssueDateTime } from '#layers/workspace/app/shared/components/IssueAttributeFields/issueDateTime'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import type { IssueAttributeField, IssueAttributeValueInput } from './IssueAttributeFields.types'

type Schemas = components['schemas']
export type IssueAttributeDto = Schemas['AttributeDto']

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

export const mapIssueAttributeValues = (values: IssueAttributeValueInput[]) => {
  return values.map((value) => {
    switch (value.type) {
      case 'text':
        return {
          $type: 'string' as const,
          attributeId: Number(value.attributeId),
          value: value.value,
        }
      case 'list':
        return {
          $type: 'enum' as const,
          attributeId: Number(value.attributeId),
          valueId: Number(value.valueId),
        }
      case 'integer':
        return {
          $type: 'integer' as const,
          attributeId: Number(value.attributeId),
          value: Number(value.value),
        }
      case 'decimal':
        return {
          $type: 'decimal' as const,
          attributeId: Number(value.attributeId),
          value: Number(value.value),
        }
      case 'date':
        return {
          $type: 'date' as const,
          attributeId: Number(value.attributeId),
          value: value.value,
        }
      case 'dateTime':
        return {
          $type: 'datetime' as const,
          attributeId: Number(value.attributeId),
          value: toUtcIssueDateTime(value.value),
        }
      default:
        return assertNever(value)
    }
  }) satisfies Schemas['AttributeValue'][]
}
