import type { components } from '#infrastructure/api/generated'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import type { IssueAttributeField } from '../IssueAttributeFields/IssueAttributeFields.types'
import { toUtcIssueDateTime } from '../IssueAttributeFields/issueDateTime'
import { getIssueAttributeFilterInput, normalizeIssueAttributeFilters } from './IssueFilters.utils'
import type { AttributeFilterInput } from './IssueFilters.types'

type Schemas = components['schemas']

export const mapIssueFilters = (filters: AttributeFilterInput[]) => {
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

// The attribute filters from the address, for an issue search.
export const mapRawIssueFilters = (
  raw: Record<string, string[]>,
  attributes: IssueAttributeField[],
) =>
  mapIssueFilters(
    getIssueAttributeFilterInput(normalizeIssueAttributeFilters(raw, attributes), attributes),
  )
