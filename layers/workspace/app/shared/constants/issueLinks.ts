import type { IssueLinkRelation } from '#layers/workspace/app/shared/components/IssueDetails/components/IssueLinks/IssueLinks.types'

// The order the groups show in: what holds the issue back first.
export const ISSUE_LINK_RELATIONS: IssueLinkRelation[] = [
  'blockedBy',
  'blocks',
  'relatesTo',
  'duplicates',
  'duplicatedBy',
]

