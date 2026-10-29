import type { components } from '#infrastructure/api/generated'

// What a link means from the side of the issue it is shown on: "this issue is blocked by ISS-2".
export type IssueLinkRelation = 'blockedBy' | 'blocks' | 'duplicatedBy' | 'duplicates' | 'relatesTo'

// The order the groups show in: what holds the issue back first.
export const ISSUE_LINK_RELATIONS: IssueLinkRelation[] = [
  'blockedBy',
  'blocks',
  'relatesTo',
  'duplicates',
  'duplicatedBy',
]

export type IssueLinkViewModel = {
  issueKey: string
  relation: IssueLinkRelation
  statusCategory: components['schemas']['StatusCategory']
  statusColor: string
  // Empty for an issue in its space's backlog, which has no status of its own.
  statusLabel: string
  title: string
}
