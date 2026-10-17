import type { IssueLinkRelation } from './IssueLinks.types'

// `notFound`: no issue with that key in the organization, or one the user cannot see.
export type IssueLinkAddResult = { outcome: 'added' } | { outcome: 'notFound' }

export type IssueLinksDeps = {
  add: (input: {
    issueKey: string
    otherIssueKey: string
    relation: IssueLinkRelation
  }) => Promise<IssueLinkAddResult>
  remove: (input: { issueKey: string; otherIssueKey: string }) => Promise<void>
}
