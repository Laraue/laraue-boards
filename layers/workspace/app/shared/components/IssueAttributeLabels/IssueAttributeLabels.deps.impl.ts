import type { components } from '#infrastructure/api/generated'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import type { IssueAttributeLabel } from './IssueAttributeLabels.types'

type Schemas = components['schemas']

const attributeLabelKind = (type: Schemas['AttributeType']): IssueAttributeLabel['kind'] => {
  switch (type) {
    case 'Date':
      return 'date'
    case 'DateTime':
      return 'dateTime'
    default:
      return 'text'
  }
}

export const mapAttributeLabels = (
  attributes: Schemas['IssueListAttributeDto'][],
): IssueAttributeLabel[] =>
  attributes.map((attribute) => ({
    color: attribute.color,
    kind: attributeLabelKind(attribute.type),
    name: attribute.name,
    value: attribute.value,
  }))

