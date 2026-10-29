import type { components } from '#infrastructure/api/generated'
import type { IssueLinkRelation } from '#layers/workspace/app/sections/issues/shared/model/IssueLinks.types'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

type ApiRelation = components['schemas']['IssueLinkRelation']

export const mapIssueLinkRelation = (relation: ApiRelation): IssueLinkRelation => {
  switch (relation) {
    case 'Blocks':
      return 'blocks'
    case 'BlockedBy':
      return 'blockedBy'
    case 'RelatesTo':
      return 'relatesTo'
    case 'Duplicates':
      return 'duplicates'
    case 'DuplicatedBy':
      return 'duplicatedBy'
    default:
      return assertNever(relation)
  }
}

export const toApiIssueLinkRelation = (relation: IssueLinkRelation): ApiRelation => {
  switch (relation) {
    case 'blocks':
      return 'Blocks'
    case 'blockedBy':
      return 'BlockedBy'
    case 'relatesTo':
      return 'RelatesTo'
    case 'duplicates':
      return 'Duplicates'
    case 'duplicatedBy':
      return 'DuplicatedBy'
    default:
      return assertNever(relation)
  }
}
