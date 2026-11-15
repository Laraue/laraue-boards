import type { components } from '#infrastructure/api/generated'

// What a link means from the side of the issue it is shown on: "this issue is blocked by ISS-2".
export type IssueLinkRelation = 'blockedBy' | 'blocks' | 'duplicatedBy' | 'duplicates' | 'relatesTo'

export type IssueLinkViewModel = {
  issueKey: string
  relation: IssueLinkRelation
  statusCategory: components['schemas']['StatusCategory']
  statusColor: string
  // Empty for an issue in its space's backlog, which has no status of its own.
  statusLabel: string
  title: string
}
